const express = require("express");
const router = express.Router();

// ✅ IMPORT CONTROLLERS FIRST
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
} = require("../controllers/products");

// =========================
// STATIC ROUTES FIRST
// =========================

// Get all products
router.route("/")
  .get(getAllProducts)
  .post(createProduct);

// Search products
router.get("/search", searchProducts);

// =========================
// DYNAMIC ROUTES LAST
// =========================

router.route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;