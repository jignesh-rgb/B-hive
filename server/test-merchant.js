const mongoose = require('mongoose');
const Merchant = require('./models/Merchant');

async function testMerchant() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/electronics_ecommerce');
    console.log('Connected to MongoDB');

    const merchants = await Merchant.find({});
    console.log('Merchants found:', merchants.length);
    console.log('Sample merchant:', merchants[0] || 'No merchants found');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testMerchant();