import fs from 'fs';

const content = fs.readFileSync('f:/oqava suv/client/src/pages/WaterUsagePage.jsx', 'utf8');

const tags = ['div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'button', 'h1', 'p', 'h3', 'h4', 'select', 'option', 'input', 'Calendar', 'Clock', 'Users', 'Download', 'Filter', 'Search', 'CheckCircle', 'XCircle', 'AlertCircle', 'Camera', 'Edit2', 'FileText', 'MoreVertical', 'RoleSelectionModal', 'EmployeeEditModal'];

console.log('--- Tag Balance Check ---');

tags.forEach(tag => {
    const open = (content.match(new RegExp(`<${tag}(\\s|>)`, 'g')) || []).length;
    const close = (content.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    const selfClosing = (content.match(new RegExp(`<${tag}[^>]*/>`, 'g')) || []).length;
    
    const diff = open - close - selfClosing;
    if (diff !== 0) {
        console.log(`❌ Tag mismatch: <${tag}> (Open: ${open}, Close: ${close}, Self-Closing: ${selfClosing}, Diff: ${diff})`);
    } else {
        // console.log(`✅ Tag balanced: <${tag}>`);
    }
});

// Check for any text that might be interpreted as regex
const problematicChars = content.match(/[^\\]\/[^/>\s]/g);
if (problematicChars) {
    console.log(`⚠️ Potential regex issues found: ${problematicChars.join(', ')}`);
}

console.log('--- Finished ---');
