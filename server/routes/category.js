const express = require("express");

const router = express.Router();

const {
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} = require("../controllers/category");

router.route("/").get((req, res, next) => {
  console.log('Categories GET route called');
  getAllCategories(req, res, next);
}).post(createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
