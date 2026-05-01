const axios = require('axios');

async function createAdmin() {
  try {
    const res = await axios.post('http://localhost:5000/api/users/admin/create-admin', {
      username: 'admin_demo',
      name: 'Demo Admin',
      email: 'admin_demo@example.com',
      password: 'Password123!',
    });
    console.log('Admin account created successfully:', res.data.username);
  } catch (err) {
    if (err.response && err.response.data === 'Username or email already exists!') {
      console.log('Admin account already exists.');
    } else {
      console.error('Failed to create admin:', err.response ? err.response.data : err.message);
    }
  }
}

createAdmin();
