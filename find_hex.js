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
            // Matches hex codes like #2563eb, etc.
            const matches = content.match(/#[0-9a-fA-F]{3,8}\b/g);
            if (matches) {
                console.log(`File: ${fullPath}`);
                console.log(`  Matches:`, Array.from(new Set(matches)));
            }
        }
    }
}

scanDir('.');
