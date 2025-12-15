
try {
    const mod = require('./dist/server/_expo/functions/api/tours+api.js');
    console.log('Keys:', Object.keys(mod));
} catch (e) {
    console.error(e);
}
