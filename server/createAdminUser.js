// Create an admin user directly
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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

async function createAdminUser() {
  try {
    await connectDB();

    // Get credentials from command line
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.log("❌ Please provide email and password as command line arguments.");
      console.log("Usage: node createAdminUser.js <email> <password>");
      process.exit(1);
    }

    console.log("🔐 Creating admin user...\n");

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      console.log(`⚠️  User with email "${email}" already exists!`);

      if (existingUser.role === "admin") {
        console.log("ℹ️  This user is already an admin. 👑\n");
      } else {
        console.log("💡 Use makeUserAdmin.js to promote this user to admin.\n");
      }

      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = new User({
      email: email,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();

    console.log("✅ SUCCESS! Admin user created! 👑\n");
    console.log("Admin Credentials:");
    console.log("─".repeat(50));
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role:     ${adminUser.role}`);
    console.log(`  User ID:  ${adminUser._id}`);
    console.log("─".repeat(50));
    console.log("\n🎉 You can now login with these credentials!\n");
    console.log("⚠️  IMPORTANT: Please save these credentials securely!\n");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
