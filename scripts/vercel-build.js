const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const api = path.join(root, 'api');

// Minimal Adapter: Bridges Node.js Request/Response to Expo's Fetch API standard
const adapter = `
exports.handleRequest=async(q,s,m,p={})=>{try{const M=q.method?.toUpperCase()||'GET',h=m[M]||m.default;if(typeof h!=='function')return s.statusCode=405,s.end();const u=new URL(q.url,\`\${q.headers['x-forwarded-proto']||'http'}://\${q.headers.host}\`),b=(M!=='GET'&&M!=='HEAD')?Buffer.concat(await(async()=>{const c=[];for await(const d of q)c.push(d);return c})()):undefined,r=await h(new Request(u,{method:M,headers:q.headers,body:b}),{params:p});s.statusCode=r.status;r.headers.forEach((v,k)=>s.setHeader(k,v));if(r.body){const d=r.body.getReader();try{while(true){const{done,value}=await d.read();if(done)break;s.write(value)}}finally{d.releaseLock()}}else s.write(await r.text());s.end()}catch(e){console.error(e);s.statusCode=500;s.end()}};
`;

console.log('Building Vercel Backend...');

// 1. Validation: Ensure 'dist' exists (run 'npx expo export -p web' first)
if (!fs.existsSync(dist)) { console.error('Error: dist/ not found.'); process.exit(1); }

// 2. Prep: Clean and recreate the 'api' output directory
if (fs.existsSync(api)) fs.rmSync(api, { recursive: true });
fs.mkdirSync(api);

// 3. Logic: Copy Expo's compiled server functions to the api directory
fs.cpSync(path.join(dist, 'server', '_expo'), path.join(api, '_expo'), { recursive: true });

// 4. Database: Find and copy Prisma Binaries (Essential for Vercel/Linux)
const prisma = path.join(root, 'node_modules', '.prisma', 'client');
if (fs.existsSync(prisma)) {
    // Find the linux binary (libquery_engine...)
    fs.readdirSync(prisma).filter(f => f.includes('libquery_engine') && f.endsWith('.node')).forEach(f => {
        // Copy to 3 locations where Vercel/Prisma might look for it
        [api, path.join(api, '.prisma/client'), path.join(api, '_expo/functions')].forEach(d => {
            fs.mkdirSync(d, { recursive: true });
            fs.copyFileSync(path.join(prisma, f), path.join(d, f));
        });
    });
}

// 5. Router: Generate the Monolithic Entry Point
fs.writeFileSync(path.join(api, '_adapter.js'), adapter);

// Parse routes.json to get all API endpoints
const routes = fs.existsSync(path.join(dist, 'server/_expo/routes.json')) ?
    JSON.parse(fs.readFileSync(path.join(dist, 'server/_expo/routes.json'))) : { apiRoutes: [] };

// Create the route map (Regex -> Require)
const routeList = (routes.apiRoutes || [])
    .filter(r => r.page.startsWith('/api'))
    .map(r => `{regex:new RegExp('${r.namedRegex.replace(/\\/g, '\\\\')}'),load:()=>require('./${r.file}')}`).join(',');

// Write api/index.js - The single function that handles ALL requests
fs.writeFileSync(path.join(api, 'index.js'), `
const {handleRequest}=require('./_adapter');const fs=require('fs');const p=require('path');
const routes=[${routeList}];
// Setup Prisma Library Path
const bin='libquery_engine-rhel-openssl-3.0.x.so.node';
const found=[p.join(__dirname,bin),p.join(process.cwd(),bin)].find(f=>fs.existsSync(f));
if(found)process.env.PRISMA_QUERY_ENGINE_LIBRARY=found;

// Main Handler
module.exports=async(q,s)=>{try{
    const[u]=q.url.split('?');
    // Match URL to Route
    const r=routes.find(x=>x.regex.test(u));
    if(!r)return s.statusCode=404,s.end();
    // Execute Request
    await handleRequest(q,s,r.load(),r.regex.exec(u).groups||{})
}catch(e){console.error(e);s.statusCode=500,s.end()}};
`);

// 6. Config: Update vercel.json to route traffic to api/index.js
fs.writeFileSync(path.join(root, 'vercel.json'), JSON.stringify({
    version: 2,
    cleanUrls: true,
    functions: { "api/index.js": { includeFiles: "api/**/*.node" } },
    rewrites: [{ source: "/api/(.*)", destination: "/api/index" }]
}, null, 2));

console.log('Done. Ready to deploy.');
