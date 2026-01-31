#!/usr/env/bin/node
import fs from 'fs';
import fsP from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.resolve(process.cwd(), './cflconf.json');

/** --- API & PARSER --- */

export async function parseCFL(inputSource) {
    const stream = typeof inputSource === 'string' ? fs.createReadStream(inputSource) : inputSource;
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    const result = { files: {}, toRemove: [], newStructure: false };
    let currentFile = null, currentContent = [], inRemoveBlock = false;

    for await (const line of rl) {
        const trimmed = line.trim();
        if (trimmed === '[<##NEWSTRUCTURE>]') { result.newStructure = true; continue; }
        if (trimmed === '[<##FILETOREMOVE>]') { inRemoveBlock = true; continue; }
        if (trimmed === '[<##ENDFILETOREMOVE>]') { inRemoveBlock = false; continue; }
        
        if (inRemoveBlock && trimmed) { result.toRemove.push(trimmed); continue; }

        if (line.startsWith('[<FILE:') && line.endsWith('>]')) {
            currentFile = line.slice(7, -2);
            currentContent = [];
            continue;
        }
        if (currentFile && line === `[<ENDFILE:${currentFile}>]`) {
            result.files[currentFile] = currentContent.join('\n');
            currentFile = null;
            continue;
        }
        if (currentFile !== null) currentContent.push(line);
    }
    return result;
}

/** --- CORE LOGIC --- */

async function applyDirectives(result, config) {
    const absInput = path.resolve(__dirname, config.inputDir);

    // 1. Safe NEWSTRUCTURE (Hanya isi inputDir)
    if (result.newStructure) {
        console.log(`⚠️  NEWSTRUCTURE: Cleaning ${config.inputDir} content...`);
        if (fs.existsSync(absInput)) {
            const entries = await fsP.readdir(absInput);
            for (const entry of entries) {
                // Jangan hapus file exclude (seperti node_modules)
                if (config.exclude?.includes(entry)) continue;
                await fsP.rm(path.join(absInput, entry), { recursive: true, force: true });
            }
        } else {
            await fsP.mkdir(absInput, { recursive: true });
        }
    }

    // 2. FILETOREMOVE
    for (const relPath of result.toRemove) {
        const fullPath = path.join(absInput, relPath);
        if (fs.existsSync(fullPath)) {
            await fsP.rm(fullPath, { recursive: true, force: true });
            console.log(`🗑️  Removed: ${relPath}`);
        }
    }

    // 3. Write Files
    for (const [filePath, content] of Object.entries(result.files)) {
        const fullPath = path.resolve(absInput, filePath);
        await fsP.mkdir(path.dirname(fullPath), { recursive: true });
        await fsP.writeFile(fullPath, content);
        console.log(`💾 Applied: ${filePath}`);
    }
}

async function runScan(config) {
    const absInput = path.resolve(__dirname, config.inputDir);
    if (!fs.existsSync(absInput)) return console.error("❌ Input Dir not found!");

    const getFiles = async (dir) => {
        const entries = await fsP.readdir(dir, { withFileTypes: true });
        let files = [];
        for (const entry of entries) {
            const res = path.resolve(dir, entry.name);
            const rel = path.relative(absInput, res);
            if (config.exclude?.some(p => rel.includes(p))) continue;
            if (entry.isDirectory()) files = files.concat(await getFiles(res));
            else files.push(res);
        }
        return files;
    };

    const files = await getFiles(absInput);
    let content = "";
    for (const file of files) {
        const rel = path.relative(absInput, file);
        const data = await fsP.readFile(file, 'utf-8');
        content += `[<FILE:${rel}>]\n${data}${data.endsWith('\n') ? '' : '\n'}[<ENDFILE:${rel}>]\n`;
    }
    await fsP.writeFile(path.resolve(__dirname, config.outputFile), content);
    console.log(`✅ Bundled ${files.length} files.`);
}

/** --- REPL MODE (FIXED) --- */

async function runRepl(config) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    console.log('\n💬 CFL REPL v1.1');
    console.log('Paste content, ketik "DONE" di baris baru untuk apply. "EXIT" untuk keluar.');
    
    let buffer = [];
    const showPrompt = () => process.stdout.write('\nCFL > ');
    showPrompt();

    for await (const line of rl) {
        const t = line.trim().toUpperCase();
        if (t === 'EXIT') break;
        if (t === 'DONE') {
            if (buffer.length > 0) {
                const result = await parseCFL(Readable.from([buffer.join('\n')]));
                await applyDirectives(result, config);
                console.log('✅ Success!');
                buffer = [];
            } else {
                console.log('⚠️  Buffer kosong.');
            }
            showPrompt();
            continue;
        }
        buffer.push(line);
    }
    rl.close();
}

/** --- BOOTSTRAP --- */

async function init() {
    const ask = (q) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        return new Promise(r => rl.question(q, a => { rl.close(); r(a); }));
    };
    const defIn = fs.existsSync('./src') ? 'src' : '.';
    const inputDir = await ask(`Input Directory (default: ${defIn}): `) || defIn;
    const outputFile = (await ask(`Filename (default: index.cfl): `) || 'index.cfl');
    const exclude = ['.git', 'node_modules', 'index.cfl', 'cflconf.json'];
    
    const config = { inputDir, outputFile, exclude };
    await fsP.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    return config;
}

const main = async () => {
    const arg = process.argv[2];
    if (!fs.existsSync(CONFIG_FILE) && arg !== '-init') await init();
    const config = JSON.parse(await fsP.readFile(CONFIG_FILE, 'utf-8'));

    switch (arg) {
        case '-scan': await runScan(config); break;
        case '-apply': 
            const res = await parseCFL(path.resolve(__dirname, config.outputFile));
            await applyDirectives(res, config); 
            break;
        case '-repl': await runRepl(config); break;
        case '-init': await init(); break;
        default: console.log("Usage: node index.js [-scan | -apply | -repl | -init]");
    }
};

main().catch(console.error);
