const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Create a minimal test app
const testApp = express();
testApp.use(express.json());
testApp.use(cors());

// Import the categories router
const categoryRouter = require('./routes/category');
testApp.use('/api/categories', categoryRouter);

// Test the categories endpoint
async function testCategories() {
  try {
    console.log('Testing categories endpoint...');
    const response = await request(testApp)
      .get('/api/categories');

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Error details:', error);
  }
}

testCategories();