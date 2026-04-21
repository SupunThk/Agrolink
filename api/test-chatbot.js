// Test script to verify chatbot connection
const http = require('http');

const testMessages = ['hi', 'what is farming', 'who created you'];

async function testChatbot(message) {
  return new Promise((resolve, reject) => {
    const encodedMessage = encodeURIComponent(message);
    const url = `http://localhost:5000/api/chatbot/chat?message=${encodedMessage}`;
    
    console.log(`\nTesting message: "${message}"`);
    console.log(`URL: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log('Raw response data:', data);
          const result = JSON.parse(data);
          console.log('Parsed JSON:', JSON.stringify(result, null, 2));
          console.log('✓ Response received:');
          console.log(`  Bot: ${result.botResponse || 'UNDEFINED'}`);
          resolve(result);
        } catch (e) {
          console.log('✗ Failed to parse response:');
          console.log(`  Raw: ${data}`);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log('✗ Connection error:', err.message);
      reject(err);
    });
  });
}

async function runTests() {
  console.log('Starting chatbot connection tests...\n');
  
  for (const msg of testMessages) {
    try {
      await testChatbot(msg);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait between requests
    } catch (err) {
      console.log(`Error testing "${msg}":`, err.message);
    }
  }
  
  console.log('\n✓ Tests completed!');
}

runTests().catch(console.error);
