// Theme Management
const themes = [
  ['#34C759', '#4CAF50', '#FFFFFF'],
  ['#2F4F7F', '#FF3737', '#FFFFFF'],
  ['#964B00', '#3E8E41', '#FFFFFF'],
  ['#FF69B4', '#33CC33', '#000000'],
  ['#007FFF', '#FFFF00', '#000000'],
  ['#008000', '#00BFFF', '#FFFFFF'],
  ['#FFC0CB', '#C9E4CA', '#000000'],
  ['#FF0000', '#FFFF00', '#000000'],
  ['#F7F7F7', '#333333', '#333333'],
  ['#FF69B4', '#33CC33', '#000000'],
  ['#8B9467', '#F5F5DC', '#FFFFFF'],
  ['#3498DB', '#F1C40F', '#000000'],
  ['#2ECC71', '#E74C3C', '#FFFFFF'],
  ['#9B59B6', '#1ABC9C', '#FFFFFF'],
  ['#E67E73', '#2C3E50', '#FFFFFF'],
  ['#1ABC9C', '#F7DC6F', '#000000'],
  ['#F1C40F', '#2ECC71', '#000000'],
  ['#E74C3C', '#3498DB', '#FFFFFF'],
  ['#2C3E50', '#E67E73', '#FFFFFF'],
  ['#9C27B0', '#3F51B5', '#FFFFFF']
];

export function initThemes() {
  const themeGrid = document.getElementById('themeGrid');
  
  themes.forEach(theme => {
    const button = document.createElement('button');
    button.className = 'theme-btn';
    button.style.background = `linear-gradient(135deg, ${theme[0]}, ${theme[1]})`;
    button.style.color = theme[2];
    button.innerHTML = 'Aa';
    button.onclick = () => applyTheme(theme);
    themeGrid.appendChild(button);
  });
  
  loadSavedTheme();
  updateThemeButtons();
}

function applyTheme(theme) {
  localStorage.setItem('bobPrimaryTheme', theme[0]);
  localStorage.setItem('bobAccentTheme', theme[1]);
  localStorage.setItem('bobForegroundTheme', theme[2]);
  
  document.documentElement.style.setProperty('--primary', theme[0]);
  document.documentElement.style.setProperty('--accent', theme[1]);
  document.documentElement.style.setProperty('--foreground', theme[2]);
  
  updateThemeButtons();
}

function loadSavedTheme() {
  const savedPrimary = localStorage.getItem('bobPrimaryTheme');
  const savedAccent = localStorage.getItem('bobAccentTheme');
  const savedForeground = localStorage.getItem('bobForegroundTheme');
  
  if (savedPrimary && savedAccent && savedForeground) {
    document.documentElement.style.setProperty('--primary', savedPrimary);
    document.documentElement.style.setProperty('--accent', savedAccent);
    document.documentElement.style.setProperty('--foreground', savedForeground);
  }
}

function updateThemeButtons() {
  const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const currentForeground = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
  
  document.querySelectorAll('.theme-btn').forEach((button, index) => {
    const theme = themes[index];
    const isActive = theme[0] === currentPrimary && theme[1] === currentAccent && theme[2] === currentForeground;
    button.style.opacity = isActive ? 0.5 : 1;
  });
}