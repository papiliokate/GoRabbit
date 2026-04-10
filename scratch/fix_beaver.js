import fs from 'fs';

let content = fs.readFileSync('src/generator.js', 'utf8');
let blockStart = content.lastIndexOf("} else if (lockType === 'BEAVER_CLEAR') {");
let blockEnd = content.indexOf("} else if (lockType === 'PORCUPINE_WARREN') {", blockStart);

let newBlock = `} else if (lockType === 'BEAVER_CLEAR') {
            const isTop = Math.random() > 0.5;
            let dist = Math.floor(Math.random() * 4) + 1; // 1 to 4 tiles away
            if (isTop) {
                let d = 1;
                while (d <= dist) {
                   if (by - d <= 0) break;
                   if (grid[by - d][doorX] !== ' ') break;
                   d++;
                }
                d--;
                if (d < 1) d = 1;
                grid[by - d][doorX] = 'Bv';
                grid[by][doorX] = 'T';
            } else {
                let d = 1;
                while (d <= dist) {
                   if (by + d >= h - 1) break;
                   if (grid[by + d][doorX] !== ' ') break;
                   d++;
                }
                d--;
                if (d < 1) d = 1;
                grid[by + d][doorX] = 'B^';
                grid[by][doorX] = 'T';
            }
         `;

content = content.substring(0, blockStart) + newBlock + content.substring(blockEnd);
fs.writeFileSync('src/generator.js', content, 'utf8');
console.log('Replaced block successfully');
