// List all users in the database
const mongoose = require('mongoose');
const User = require('./models/User');

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

async function listUsers() {
  try {
    await connectDB();

    console.log("🔍 Fetching all users from database...\n");

    const users = await User.find({}, {
      _id: 1,
      email: 1,
      role: 1,
    });

    if (users.length === 0) {
      console.log("❌ No users found in database.");
      console.log("💡 Please register a user first through the application.\n");
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    console.log("─".repeat(80));
    console.log(
      "| No | Email                           | Role       | User ID"
    );
    console.log("─".repeat(80));

    users.forEach((user, index) => {
      const roleIcon = user.role === "admin" ? "👑" : "👤";
      console.log(
        `| ${(index + 1).toString().padEnd(2)} | ${user.email.padEnd(
          31
        )} | ${roleIcon} ${user.role?.padEnd(6) || "user  "} | ${user._id}`
      );
    });

    console.log("─".repeat(80));
    console.log(
      "\n💡 To make a user admin, use: node makeUserAdmin.js <email>\n"
    );
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();