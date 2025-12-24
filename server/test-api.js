// Simple test to check API endpoints
const API_BASE_URL = "http://localhost:5000";

async function testAPI() {
  try {
    console.log("Testing categories endpoint...");
    const categoriesRes = await fetch(`${API_BASE_URL}/api/categories`);
    console.log(`Categories status: ${categoriesRes.status}`);
    const categories = await categoriesRes.json();
    console.log(`Found ${categories.length} categories`);

    console.log("\nTesting merchants endpoint...");
    const merchantsRes = await fetch(`${API_BASE_URL}/api/merchants`);
    console.log(`Merchants status: ${merchantsRes.status}`);
    const merchants = await merchantsRes.json();
    console.log(`Found ${merchants.length} merchants`);

    if (categories.length > 0 && merchants.length > 0) {
      console.log("\n✅ Ready to test product creation!");
      return { categoryId: categories[0].id, merchantId: merchants[0].id };
    } else {
      console.log("\n❌ Need to create categories and merchants first");
      return null;
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message);
    return null;
  }
}

testAPI();