import fs from 'fs';

const content = fs.readFileSync('f:/oqava suv/client/src/pages/WaterUsagePage.jsx', 'utf8');

const openTags = (content.match(/<div/g) || []).length;
const closeTags = (content.match(/<\/div>/g) || []).length;

console.log(`Open <div> tags: ${openTags}`);
console.log(`Close </div> tags: ${closeTags}`);

// Trace them
const lines = content.split('\n');
let balance = 0;
lines.forEach((line, i) => {
    const lineOpen = (line.match(/<div/g) || []).length;
    const lineClose = (line.match(/<\/div>/g) || []).length;
    balance += lineOpen - lineClose;
    if (balance < 0) {
        console.log(`Error: Negative balance at line ${i + 1}: ${line}`);
        balance = 0; // reset to continue
    }
});

console.log(`Final balance: ${balance}`);
