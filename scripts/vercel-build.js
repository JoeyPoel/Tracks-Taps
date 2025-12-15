const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const distServerDir = path.join(distDir, 'server');
const distClientDir = path.join(distDir, 'client');

// NOTE: This adapter mimics what @expo/server/adapter/vercel does,
// converting Node.js (req, res) to Web Standard (Request, Response) for the Expo handler.
const ADAPTER_CODE = `
const { Request, Response, Headers } = global; 

exports.createHandler = (mod) => async (req, res) => {
    try {
        const method = req.method ? req.method.toUpperCase() : 'GET';
        const handler = mod[method] || mod.default;

        if (typeof handler !== 'function') {
            console.error('Handler not found for method:', method);
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
        }

        // Construct full URL
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const url = new URL(req.url, \`\${protocol}://\${host}\`);

        // Handle body
        let body = undefined;
        if (method !== 'GET' && method !== 'HEAD') {
            // Simple buffering for body
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            body = Buffer.concat(buffers);
        }

        // Create Web Request
        const request = new Request(url, {
            method,
            headers: req.headers,
            body
        });

        // Execute Expo/Web Handler
        const response = await handler(request);

        // Convert Web Response to Node Response
        res.statusCode = response.status;
        
        // Handle headers
        response.headers.forEach((value, key) => {
             res.setHeader(key, value);
        });

        // Pipe body
        if (response.body) {
            const reader = response.body.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(value);
                }
            } finally {
                reader.releaseLock();
            }
        } else {
             const text = await response.text();
             res.write(text);
        }
        res.end();

    } catch (e) {
        console.error('Adapter Error:', e);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
};
`;

async function build() {
    console.log('Flattening build output for Vercel...');

    if (!fs.existsSync(distDir)) {
        console.error('dist directory not found. Run expo export first.');
        process.exit(1);
    }

    // Move client files to root of dist
    if (fs.existsSync(distClientDir)) {
        console.log('Copying client files...');
        fs.cpSync(distClientDir, distDir, { recursive: true });
        // NOTE: We do NOT remove distClientDir immediately as we might need to debug
    }

    // Write Adapter
    const adapterPath = path.join(distDir, '_adapter.js');
    fs.writeFileSync(adapterPath, ADAPTER_CODE);
    console.log('Adapter created at', adapterPath);

    // Ensure api directory exists
    const apiDir = path.join(distDir, 'api');
    if (!fs.existsSync(apiDir)) {
        fs.mkdirSync(apiDir, { recursive: true });
    }

    // Process Routes
    const routesJsonPath = path.join(distServerDir, '_expo/routes.json');
    if (fs.existsSync(routesJsonPath)) {
        console.log('Generating API entry points from routes.json...');
        const routes = JSON.parse(fs.readFileSync(routesJsonPath, 'utf8'));

        // Handle API Routes
        if (routes.apiRoutes) {
            for (const route of routes.apiRoutes) {
                // page usually starts with /api/...
                const page = route.page;
                if (!page.startsWith('/api')) continue;

                const targetPath = path.join(distDir, page + '.js'); // e.g. dist/api/tours.js
                const targetDir = path.dirname(targetPath);

                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                // Calculate relative path to the source function
                // Source is in dist/server/_expo/functions/...
                const sourceAbsPath = path.join(distServerDir, route.file);

                // We need to require this file from targetPath.
                let relativePath = path.relative(targetDir, sourceAbsPath);
                // Ensure starts with ./ or ../
                if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
                // Use slash for require
                relativePath = relativePath.split(path.sep).join('/');

                // Calculate relative path to adapter
                let relativeAdapterPath = path.relative(targetDir, adapterPath);
                if (!relativeAdapterPath.startsWith('.')) relativeAdapterPath = './' + relativeAdapterPath;
                relativeAdapterPath = relativeAdapterPath.split(path.sep).join('/');

                const fileContent = `
const { createHandler } = require('${relativeAdapterPath}');
const mod = require('${relativePath}');
module.exports = createHandler(mod);
                `.trim();

                fs.writeFileSync(targetPath, fileContent);
                console.log(`Generated ${page}.js -> wraps ${route.file}`);
            }
        }
    }

    // Generate clean vercel.json
    console.log('Generating vercel.json...');
    const vercelConfig = {
        version: 2,
        cleanUrls: true,
        outputDirectory: "dist",
        rewrites: [
            // SPA Fallback for non-API routes
            { "source": "/(.*)", "destination": "/index.html" }
        ]
    };

    fs.writeFileSync(path.join(distDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
    fs.writeFileSync(path.join(__dirname, '../vercel.json'), JSON.stringify(vercelConfig, null, 2));

    console.log('vercel.json generated.');
}

build();
