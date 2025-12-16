const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const distServerDir = path.join(distDir, 'server');
const distClientDir = path.join(distDir, 'client');

// Adapter to bridge standard Web Requests (Expo) to Node.js (Vercel)
const ADAPTER_CODE = `
const { Request, Response, Headers } = global; 

exports.handleRequest = async (req, res, mod, params = {}) => {
    try {
        const method = req.method ? req.method.toUpperCase() : 'GET';
        const handler = mod[method] || mod.default;

        if (typeof handler !== 'function') {
            console.error('Handler not found for method:', method);
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
        }

        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const url = new URL(req.url, \`\${protocol}://\${host}\`);

        let body = undefined;
        if (method !== 'GET' && method !== 'HEAD') {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            body = Buffer.concat(buffers);
        }

        const request = new Request(url, {
            method,
            headers: req.headers,
            body
        });

        const response = await handler(request, { params });

        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
             res.setHeader(key, value);
        });

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
    console.log('Starting Vercel Post-Build Script...');

    if (!fs.existsSync(distDir)) {
        console.error('dist directory not found. Run expo export first.');
        process.exit(1);
    }

    // 1. ASSET FLATTENING
    // Ensure all static assets are in the root of 'dist'
    if (fs.existsSync(distClientDir)) {
        console.log('Copying Client Assets from dist/client...');
        fs.cpSync(distClientDir, distDir, { recursive: true, force: true });
    }
    
    // Copy index.html from server output to root (Critical for SPA)
    const serverIndexHtml = path.join(distServerDir, 'index.html');
    const rootIndexHtml = path.join(distDir, 'index.html');
    if (fs.existsSync(serverIndexHtml)) {
        console.log('Copying index.html to dist root...');
        fs.copyFileSync(serverIndexHtml, rootIndexHtml);
    } else {
        console.warn('WARNING: dist/server/index.html not found. SPA fallback might fail.');
    }

    // 2. MONOLITHIC API GENERATION
    // We generate a single "api/index.js" function that handles ALL /api/* requests.
    // This avoids Vercel's 12-function limit and ensures consistent routing.
    
    // Create 'api' folder in PROJECT ROOT
    const apiDir = path.join(projectRoot, 'api');
    if (fs.existsSync(apiDir)) {
        fs.rmSync(apiDir, { recursive: true, force: true });
    }
    fs.mkdirSync(apiDir, { recursive: true });

    // Copy Server Chunks (Logic) to api/_expo
    // This ensures the monolithic router has access to all compiled API logic
    const distExpoServerDir = path.join(distServerDir, '_expo');
    const apiExpoDir = path.join(apiDir, '_expo');
    if (fs.existsSync(distExpoServerDir)) {
        console.log('Copying server chunks to api/_expo...');
        fs.cpSync(distExpoServerDir, apiExpoDir, { recursive: true, force: true });
    } else {
        console.warn('WARNING: dist/server/_expo not found. API will likely fail.');
    }

    // 3. PRISMA BINARY FIX
    // Vercel needs the Linux query engine next to the executing bundle.
    // We search for it in node_modules and copy it to 'api/_expo/functions/api' 
    // (where the actual route handlers are) AND 'api' root (just in case).
    const prismaClientDir = path.join(projectRoot, 'node_modules', '.prisma', 'client');
    if (fs.existsSync(prismaClientDir)) {
        console.log('Searching for Prisma Query Engine in ' + prismaClientDir);
        const files = fs.readdirSync(prismaClientDir);
        let copied = false;
        for (const file of files) {
            // Include 'rhel' (Vercel Linux) and 'windows' (Local Debugging)
            if (file.includes('libquery_engine') && file.endsWith('.node')) {
                const src = path.join(prismaClientDir, file);
                
                // 1. Copy to api entry root (api/libquery_engine...)
                fs.copyFileSync(src, path.join(apiDir, file));
                
                // 2. Copy to .prisma/client (api/.prisma/client/libquery_engine...)
                // Matches search path: /var/task/api/.prisma/client
                const destPrismaClientDir = path.join(apiDir, '.prisma', 'client');
                if (!fs.existsSync(destPrismaClientDir)) fs.mkdirSync(destPrismaClientDir, { recursive: true });
                fs.copyFileSync(src, path.join(destPrismaClientDir, file));

                // 3. Copy to functions root (api/_expo/functions/libquery_engine...)
                // Matches search path: /var/task/api/_expo/functions
                const destFunctionsDir = path.join(apiExpoDir, 'functions');
                if (!fs.existsSync(destFunctionsDir)) fs.mkdirSync(destFunctionsDir, { recursive: true });
                fs.copyFileSync(src, path.join(destFunctionsDir, file));

                // 4. Copy to deep functions path (api/_expo/functions/api/libquery_engine...)
                // Matches potential relative calls from user+api.js
                const destDeepDir = path.join(destFunctionsDir, 'api');
                if (!fs.existsSync(destDeepDir)) fs.mkdirSync(destDeepDir, { recursive: true });
                fs.copyFileSync(src, path.join(destDeepDir, file));

                console.log(`Copying Prisma Engine: ${file} to multiple locations`);
                copied = true;
            }
        }
        if (!copied) console.warn('WARNING: No libquery_engine binary found.');
    }

    // 4. GENERATE MONOLITH ROUTER
    const adapterPath = path.join(apiDir, '_adapter.js');
    fs.writeFileSync(adapterPath, ADAPTER_CODE);
    
    const routesJsonPath = path.join(distServerDir, '_expo/routes.json');
    if (fs.existsSync(routesJsonPath)) {
        console.log('Generating Monolithic API Router...');
        const routes = JSON.parse(fs.readFileSync(routesJsonPath, 'utf8'));
        const routeEntries = [];

        if (routes.apiRoutes) {
            for (const route of routes.apiRoutes) {
                if (!route.page.startsWith('/api')) continue;

                // Path relative to api/index.js
                // Route file is usually _expo/functions/api/name.js
                let relativePath = './' + route.file.split(path.sep).join('/');
                
                routeEntries.push(`
    {
        name: '${route.page}', 
        regex: new RegExp('${route.namedRegex.replace(/\\/g, '\\\\')}'),
        load: () => require('${relativePath}')
    }`);
            }
            // Add Debug Route
             routeEntries.push(`
    {
        name: '/api/debug',
        regex: new RegExp('^/api/debug(?:/)?$'),
        load: () => ({
            GET: async () => new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }))
        })
    }`);
        }

        const indexContent = `
const { handleRequest } = require('./_adapter');
const path = require('path');
const fs = require('fs');

const routes = [${routeEntries.join(',')}];

// --- PRISMA BINARY SETUP ---
const binaryName = 'libquery_engine-rhel-openssl-3.0.x.so.node';
const possiblePaths = [
    path.join(__dirname, binaryName),                                  // api/binary
    path.join(__dirname, '.prisma', 'client', binaryName),             // api/.prisma/client/binary
    path.join(__dirname, '_expo', 'functions', 'api', binaryName),     // api/_expo/functions/api/binary
    path.join(__dirname, '_expo', 'functions', binaryName),            // api/_expo/functions/binary
    // Fallback for Vercel/Lambda environments
    path.join(process.cwd(), binaryName),
    path.join(process.cwd(), 'api', binaryName)
];

let binaryPath = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        binaryPath = p;
        break;
    }
}

if (binaryPath) {
    console.log('[MONOLITH] Found Prisma Binary at:', binaryPath);
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = binaryPath;
} else {
    console.warn('[MONOLITH] WARNING: Prisma Binary NOT FOUND. Debugging info:');
    try {
        console.log('__dirname:', __dirname);
        console.log('Files in __dirname:', fs.readdirSync(__dirname));
        const deepPath = path.join(__dirname, '_expo', 'functions', 'api');
        if (fs.existsSync(deepPath)) {
            console.log('Files in ' + deepPath + ':', fs.readdirSync(deepPath));
        } else {
            console.log(deepPath + ' does not exist.');
        }
    } catch (e) {
        console.error('[MONOLITH] Error listing files:', e.message);
    }
}
// ---------------------------

module.exports = async (req, res) => {
    try {
        const [urlPath] = req.url.split('?');
        console.log('[MONOLITH] Request:', req.method, urlPath);
        console.log('[MONOLITH] Env Check: DATABASE_URL is', process.env.DATABASE_URL ? 'DEFINED' : 'MISSING');

        let matchedParams = {};
        let matchedMod = null;

        for (const route of routes) {
            const match = route.regex.exec(urlPath);
            if (match) {
                matchedMod = route.load();
                if (match.groups) matchedParams = match.groups;
                break;
            }
        }

        if (!matchedMod) {
             console.log('[MONOLITH] 404 Not Found: ' + urlPath);
             res.statusCode = 404;
             res.end('API Route Not Found. Monolith received: ' + req.method + ' ' + urlPath);
             return;
        }
        
        await handleRequest(req, res, matchedMod, matchedParams);
        
    } catch (e) {
        console.error('[MONOLITH] Error:', e);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
};
`.trim();
        fs.writeFileSync(path.join(apiDir, 'index.js'), indexContent);
    }

    // 5. GENERATE VERCEL.JSON
    console.log('Generating vercel.json...');
    const vercelConfig = {
        version: 2,
        cleanUrls: true,
        outputDirectory: "dist",
        functions: {
            "api/index.js": {
                "includeFiles": "api/**/*.node"
            }
        },
        rewrites: [
            // Route ALL /api/* traffic to the monolithic function
            { "source": "/api/(.*)", "destination": "/api/index" },
            // SPA Fallback for everything else
            { "source": "/(.*)", "destination": "/index.html" }
        ]
    };
    fs.writeFileSync(path.join(projectRoot, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));

    console.log('Vercel Build Prep Complete.');
}

build();
