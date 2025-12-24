const mongoose = require('mongoose');
const Category = require('../models/Category');

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

async function createDefaultCategories() {
  console.log("🏗️  Creating default categories...\n");

  const categoriesToCreate = [
    { name: "electronics" },
    { name: "laptops" },
    { name: "audio" },
    { name: "televisions" },
    { name: "cameras" },
    { name: "smartphones" },
    { name: "tablets" },
    { name: "accessories" },
  ];

  try {
    await connectDB();

    for (const cat of categoriesToCreate) {
      const existing = await Category.findOne({ name: cat.name });

      if (existing) {
        console.log(
          `⏭️  Category "${cat.name}" already exists (ID: ${existing._id})`
        );
      } else {
        const created = await Category.create(cat);
        console.log(`✅ Created category "${cat.name}" (ID: ${created._id})`);
      }
    }

    console.log("\n✨ All categories ready!\n");

    // List all categories
    const allCategories = await Category.find().sort({ name: 1 });

    console.log("📋 Categories in database:");
    allCategories.forEach((cat) => {
      console.log(`   - ${cat.name.padEnd(20)} (ID: ${cat._id})`);
    });
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createDefaultCategories();