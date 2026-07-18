const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Supabase PostgreSQL Backup Script
 * Automatically extracts credentials from .env, locates pg_dump,
 * and saves backups in the git-ignored /database_backups/ folder.
 */

// 1. Ensure backup directory exists
const backupDir = path.join(__dirname, '..', 'database_backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// 2. Load and parse connection string from .env
const envPath = path.join(__dirname, '..', '.env');
let directUrl = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const directUrlMatch = envContent.match(/DIRECT_URL="([^"]+)"/) || envContent.match(/DATABASE_URL="([^"]+)"/);
    if (directUrlMatch) {
        directUrl = directUrlMatch[1];
    }
}

if (!directUrl) {
    console.error('[-] Error: No DIRECT_URL or DATABASE_URL found in .env file.');
    process.exit(1);
}

// Clean up pgbouncer query params if present
const cleanUrl = directUrl.split('?')[0];

// 3. Generate backup filename with timestamp
const now = new Date();
const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

// 4. Locate pg_dump binary
let pgDumpCmd = 'pg_dump';

// Check if pg_dump is available globally
try {
    execSync('pg_dump --version', { stdio: 'ignore' });
} catch (e) {
    // If not global, search common Windows directories dynamically
    pgDumpCmd = '';
    const pgDir = 'C:\\Program Files\\PostgreSQL';
    if (fs.existsSync(pgDir)) {
        const versions = fs.readdirSync(pgDir);
        // Sort versions descending to use the newest available version
        versions.sort((a, b) => parseFloat(b) - parseFloat(a));
        for (const version of versions) {
            const testPath = path.join(pgDir, version, 'bin', 'pg_dump.exe');
            if (fs.existsSync(testPath)) {
                pgDumpCmd = `"${testPath}"`;
                break;
            }
        }
    }
}

if (pgDumpCmd) {
    console.log(`[+] Found pg_dump executable: ${pgDumpCmd}`);
    console.log(`[+] Starting database backup...`);
    try {
        const cmd = `${pgDumpCmd} "${cleanUrl}" > "${backupFile}"`;
        execSync(cmd, { stdio: 'inherit' });
        console.log(`[+] Backup completed successfully!`);
        console.log(`[+] Saved to: ${path.relative(path.join(__dirname, '..'), backupFile)}`);
    } catch (err) {
        console.error(`[-] Backup execution failed:`, err.message);
        printManualInstructions(cleanUrl);
    }
} else {
    console.warn(`[-] Warning: Could not find 'pg_dump' utility in system PATH or typical Windows installations.`);
    printManualInstructions(cleanUrl);
}

function printManualInstructions(connectionUrl) {
    console.log('\n=========================================');
    console.log('MANUAL BACKUP INSTRUCTIONS');
    console.log('=========================================');
    console.log('If you have pgAdmin or PostgreSQL installed, you can run this command in PowerShell:');
    console.log('\n& "C:\\Program Files\\PostgreSQL\\[VERSION]\\bin\\pg_dump.exe" "' + connectionUrl + '" > database_backups\\backup_manual.sql');
    console.log('\n(Replace [VERSION] with your installed PostgreSQL version number, e.g. 18 or 17.)\n');
}
