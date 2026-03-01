const axios = require('axios');
const fs = require('fs');

const log = (msg) => {
    fs.appendFileSync('rc-output.txt', msg + '\n');
    console.log(msg);
}

async function test(authHeader) {
    try {
        log("Testing with header: " + authHeader);
        const res = await axios.get("https://api.revenuecat.com/v1/subscribers/test_user_123", {
            headers: {
                Authorization: authHeader
            }
        });
        log("Success! Data keys: " + Object.keys(res.data));
    } catch (e) {
        log("Error Status: " + (e.response ? e.response.status : e.message));
        log("Error Data: " + (e.response ? JSON.stringify(e.response.data) : ""));
    }
    log("-----------------------");
}

async function run() {
    fs.writeFileSync('rc-output.txt', '');
    const secret = "sk_ULvfoRCsysghSekdkvRBhsNEpOBQH";
    await test(`Bearer ${secret}`);
    await test(`${secret}`);
    await test(`Basic ${secret}`);
}

run();
