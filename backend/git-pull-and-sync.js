const { execSync } = require('child_process');
try {
    console.log("Searching for files/folders containing .git in /app...");
    const res = execSync('find /app -name "*git*" 2>/dev/null').toString();
    console.log(res);
} catch (e) {
    console.error(e.message);
}
