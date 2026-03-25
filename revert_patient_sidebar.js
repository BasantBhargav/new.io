const fs = require('fs');
const filePath = 'c:\\Users\\HP\\Desktop\\express_harry\\front\\patientdashboard.html';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Reverting Patient Dashboard to original layout...');

// 1. Remove Sidebar CSS
const cssMatch = /\/\* ─── SIDEBAR \(UNIFIED WITH LAB\) ─────────────────────────────── \*\/[\s\S]*?\.main-content \{[\s\S]*?margin-left: 0; padding: 1\.5rem; \}\s*\}/;
content = content.replace(cssMatch, '');

// 2. Remove Sidebar HTML
const sidebarMatch = /<!-- Sidebar -->\s*<div class="sidebar" id="sidebar">[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(sidebarMatch, '');

// 3. Remove original-header class
content = content.replace('<header class="header original-header">', '<header class="header">');

// 4. Revert main-content to main-container
content = content.replace('class="main-content"', 'class="main-container"');

// 5. Remove Sidebar Script
const scriptMatch = /\/\/ Update Sidebar Name[\s\S]*?\.classList\.add\('active'\);\s*\}\s*\);\s*\}\s*\);/;
// Wait, my regex might be slightly off due to the generic search. I'll use index based removal.

const scriptStart = content.indexOf('// Update Sidebar Name');
const scriptEnd = content.lastIndexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1 && scriptStart < scriptEnd) {
    content = content.substring(0, scriptStart) + content.substring(scriptEnd);
}

fs.writeFileSync(filePath, content);
console.log('Patient Dashboard Reverted Successfully.');
