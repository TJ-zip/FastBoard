const fs = require('fs');
const files = [
    'css/animations.css',
    'css/components.css',
    'js/app.js',
    'js/data.js'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace solid colors
    content = content.replace(/#00ff88/gi, 'var(--accent-red)');
    content = content.replace(/#00cc6a/gi, 'var(--accent-red)');
    content = content.replace(/#00aa55/gi, 'var(--border-navy)');
    content = content.replace(/#00dd77/gi, 'var(--text-secondary)');
    content = content.replace(/#88ffcc/gi, 'var(--bg-tertiary)');
    content = content.replace(/#10b981/gi, 'var(--border-navy)');
    content = content.replace(/#047857/gi, 'var(--text-primary)');
    
    // Replace rgb/rgba
    content = content.replace(/rgba\(0,\s*255,\s*136,\s*0\.[0-9]+\)/gi, 'var(--bg-tertiary)');
    content = content.replace(/rgba\(0,\s*204,\s*106,\s*0\.[0-9]+\)/gi, 'var(--bg-tertiary)');
    content = content.replace(/rgba\(0,\s*170,\s*85,\s*0\.[0-9]+\)/gi, 'var(--bg-tertiary)');
    
    // Fix JS variables that might need quotes if they are inside strings (Wait, in data.js it's tagColor: '#00ff88' -> tagColor: 'var(--accent-red)' which works if it's assigned to style)
    // Actually, data.js might be using it for canvas? No, data.js is for HTML generation.
    
    fs.writeFileSync(file, content);
});
console.log('Colors replaced successfully!');
