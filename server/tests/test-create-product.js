// Test untuk menambahkan produk
const API_BASE_URL = "http://localhost:5000";

async function testCreateProduct(categoryId, merchantId) {
  console.log("🔍 Testing create product API...\n");

  // Data produk test
  const productData = {
    title: "Test Product dari API",
    slug: `test-product-${Date.now()}`,
    price: 999,
    manufacturer: "Test Manufacturer",
    description: "This is a test product",
    mainImage: "test-product.jpg",
    categoryId: categoryId, // Menggunakan category ID yang valid
    merchantId: merchantId, // Menggunakan merchant ID yang valid
    inStock: 10,
  };

  console.log("📦 Product data:");
  console.log(JSON.stringify(productData, null, 2));
  console.log("\n");

  try {
    console.log(`📤 Sending POST request to ${API_BASE_URL}/api/products...\n`);

    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    console.log(`📥 Response status: ${res.status}`);

    const text = await res.text();
    console.log(`📥 Response body:`);

    try {
      const json = JSON.parse(text);
      console.log(JSON.stringify(json, null, 2));
    } catch {
      console.log(text);
    }

    if (res.status === 201) {
      console.log("\n✅ Product created successfully!");
    } else {
      console.log("\n❌ Failed to create product");
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

async function getCategories() {
  console.log("📋 Getting categories first...\n");
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`);
    const categories = await res.json();

    console.log("Available categories:");
    categories.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.id})`);
    });

    if (categories.length > 0) {
      console.log(`\n✅ Using category: ${categories[0].name}`);
      return categories[0].id;
    } else {
      console.error("❌ No categories available. Please create a category first.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting categories:", error.message);
    return null;
  }
}

async function getMerchants() {
  console.log("📋 Getting merchants first...\n");
  try {
    const res = await fetch(`${API_BASE_URL}/api/merchants`);
    const merchants = await res.json();

    console.log("Available merchants:");
    merchants.forEach((merchant) => {
      console.log(`   - ${merchant.name} (${merchant.id})`);
    });

    if (merchants.length > 0) {
      console.log(`\n✅ Using merchant: ${merchants[0].name}`);
      return merchants[0].id;
    } else {
      console.error("❌ No merchants available. Please create a merchant first.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting merchants:", error.message);
    return null;
  }
}

// Main
(async () => {
  const categoryId = await getCategories();
  const merchantId = await getMerchants();

  if (!categoryId || !merchantId) {
    console.log("❌ Cannot proceed without category and merchant");
    return;
  }

  console.log("\n" + "=".repeat(50));
  await testCreateProduct(categoryId, merchantId);
})();
