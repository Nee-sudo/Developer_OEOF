const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            if (childItemName === 'node_modules') return;
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    console.log("--- Pristine Sync with Nee-sudo/Neeraj_OEOF ---");
    execSync('rm -rf /tmp/Neeraj_OEOF', { stdio: 'inherit' });
    execSync('git clone https://github.com/Nee-sudo/Neeraj_OEOF.git /tmp/Neeraj_OEOF', { stdio: 'inherit' });

    const srcBackend = '/tmp/Neeraj_OEOF/backend';
    const destBackend = '/app/applet/backend';

    if (!fs.existsSync(srcBackend)) {
        throw new Error("Source backend folder not found in cloned repo!");
    }

    // Clean destination backend folder except node_modules and scripts
    console.log("Cleaning dest backend folders (excluding node_modules)...");
    const destFiles = fs.readdirSync(destBackend);
    destFiles.forEach(file => {
        if (file === 'node_modules') return;
        const fullPath = path.join(destBackend, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(fullPath);
        }
    });

    console.log("Copying pristine files from clone to dest...");
    copyRecursiveSync(srcBackend, destBackend);

    console.log("Scanning backend files for conflict markers...");
    function scanAndLogConflicts(dir) {
        fs.readdirSync(dir).forEach(file => {
            if (file === 'node_modules') return;
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                scanAndLogConflicts(fullPath);
            } else {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('<<<<<<<') || content.includes('=======') || content.includes('>>>>>>>')) {
                    console.log(`[WARNING] Conflict marker found in ${fullPath}`);
                }
            }
        });
    }
    scanAndLogConflicts(destBackend);

    console.log("Sync complete!");
} catch (e) {
    console.error("Error during sync:", e.message);
}
