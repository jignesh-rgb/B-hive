const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

console.log('MONGODB_URI:', process.env.MONGODB_URI);

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();