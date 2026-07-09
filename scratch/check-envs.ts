import fs from 'fs';
import path from 'path';

function check() {
    const envPath = path.join(__dirname, '../.env');
    const localEnvPath = path.join(__dirname, '../.env.local');

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
        console.log('.env DATABASE_URL:', dbUrlLine ? dbUrlLine.trim().split('=')[1] : 'NOT FOUND');
    } else {
        console.log('.env file not found');
    }

    if (fs.existsSync(localEnvPath)) {
        const localEnvContent = fs.readFileSync(localEnvPath, 'utf8');
        const dbUrlLine = localEnvContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
        console.log('.env.local DATABASE_URL:', dbUrlLine ? dbUrlLine.trim().split('=')[1] : 'NOT FOUND');
    } else {
        console.log('.env.local file not found');
    }
}
check();
