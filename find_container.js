import fs from 'fs';
import path from 'path';

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
                scanDir(fullPath);
            }
        } else if (fullPath.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('.page-container')) {
                console.log(`File: ${fullPath} contains .page-container`);
                // Print lines containing .page-container
                const lines = content.split('\n');
                lines.forEach((line, idx) => {
                    if (line.includes('.page-container')) {
                        console.log(`  Line ${idx+1}: ${line.trim()}`);
                        // print next 5 lines
                        for (let i = 1; i <= 5; i++) {
                            if (lines[idx+i]) console.log(`    ${lines[idx+i].trim()}`);
                        }
                    }
                });
            }
        }
    }
}

scanDir('.');
