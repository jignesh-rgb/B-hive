const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Default admin credentials (can be overridden by environment variables)
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@mailinator.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin@123';

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/electronics_ecommerce');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedAdminUser() {
  try {
    await connectDB();

    console.log('🌱 Seeding admin user...\n');

    // Check if any admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    console.log(existingAdmin);
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('   Skipping creation to maintain idempotency.\n');
      return;
    }

    // Check if user with default email exists (but not admin)
    const existingUser = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });

    if (existingUser) {
      console.log(`⚠️  User with email "${DEFAULT_ADMIN_EMAIL}" exists but is not admin.`);
      console.log('   Promoting to admin...\n');

      existingUser.role = 'admin';
      await existingUser.save();

      console.log('✅ SUCCESS! User promoted to admin! 👑\n');
      console.log('Admin Credentials:');
      console.log('─'.repeat(50));
      console.log(`  Email:    ${existingUser.email}`);
      console.log(`  Role:     ${existingUser.role}`);
      console.log(`  User ID:  ${existingUser._id}`);
      console.log('─'.repeat(50));
      console.log('\n🎉 You can now login with admin privileges!\n');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    // Create default admin user
    const adminUser = new User({
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();

    console.log('✅ SUCCESS! Default admin user created! 👑\n');
    console.log('Admin Credentials:');
    console.log('─'.repeat(50));
    console.log(`  Email:    ${DEFAULT_ADMIN_EMAIL}`);
    console.log(`  Password: ${DEFAULT_ADMIN_PASSWORD}`);
    console.log(`  Role:     ${adminUser.role}`);
    console.log(`  User ID:  ${adminUser._id}`);
    console.log('─'.repeat(50));
    console.log('\n🎉 You can now login with these credentials!');
    console.log('⚠️  IMPORTANT: Change the default password in production!\n');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the seed function
seedAdminUser();