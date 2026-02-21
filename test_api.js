const axios = require('axios');

async function testVerify() {
    try {
        // This test assumes there is a user in the database.
        // If not, we could first register one, but let's try a common check.
        const res = await axios.post('http://localhost:5000/api/auth/verify', {
            username: "nonexistentuser",
            password: "wrongpassword"
        });
        console.log("Response:", res.data);
    } catch (err) {
        if (err.response) {
            console.log("Caught expected error:", err.response.data);
        } else {
            console.log("Error:", err.message);
        }
    }
}

testVerify();
