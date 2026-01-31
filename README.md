# CFL (Context File Language)
CFL is a revolutionary code exchange format designed to bridge local development with AI. Stop wasting time copy-pasting individual files. CFL bundles your entire project context into a single, structured format that AI understands perfectly, enabling automated file system updates without losing context.
Why Choose CFL?
CFL offers a streamlined alternative to traditional AI interaction methods:
| Feature | CFL (Your Tool) | MCP (Model Context Protocol) | Manual Copy-Paste |
|---|---|---|---|
| Token Usage | Low. Minimalist delimiters and targeted excludes. | Medium. Significant JSON-RPC protocol overhead. | High. Redundant context and formatting bloat. |
| Setup | Instant. One cflconf.json file. | Complex. Requires server config and tool definitions. | None. But physically exhausting. |
| Implementation | Automated. Just run -apply. | Dependent on specific IDE integrations. | Manual. High risk of "human error." |
| Context | Full Project. Complete project snapshot. | Dynamic (often fragmented). | Disorganized and messy. |
🛠️ Getting Started
1. Initialize Project
Navigate to your project folder and run:
cfl -init

This command generates a cflconf.json file to manage input directories and excluded patterns like node_modules or .git.
2. Bundling (Scan for AI)
To wrap your project into a single .cfl file:
cfl -scan

Simply attach or paste the content of index.cfl into your AI chat.
3. Apply Changes (Sync from AI)
When the AI provides a response in CFL format, you can apply it instantly:
 * Via File: cfl -apply (reads directly from your output file).
 * Via REPL: cfl -repl (paste the AI response and type DONE to execute).
📝 CFL Standard Syntax
AI communicates with your system using specific, lightweight delimiters:
 * File Wrapper:
   [<FILE:path/to/file.js>]
// Code content goes here...
[<ENDFILE:path/to/file.js>]

 * Remove Directives:
   [<##FILETOREMOVE>]
path/to/obsolete_file.js
[<##ENDFILETOREMOVE>]

 * Structure Reset:
   The [<##NEWSTRUCTURE>] flag triggers a directory cleanup before writing new files, ensuring a fresh state.
