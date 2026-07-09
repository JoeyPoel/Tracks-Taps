async function test() {
    try {
        const res = await fetch('http://localhost:8081/api/tours');
        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
test();
