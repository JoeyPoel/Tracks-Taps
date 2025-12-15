
try {
    const adapter = require('@expo/server/adapter/vercel');
    console.log('Adapter found:', adapter);
} catch (e) {
    console.error('Adapter not found:', e.message);
    try {
        require('expo/server/adapter/vercel')
        console.log('Adapter found in expo/server');
    } catch (e2) {
        console.error(e2.message);
    }
}
