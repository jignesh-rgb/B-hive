const Category = require('../models/Category');
const { asyncHandler, AppError } = require("../utills/errorHandler");

const createCategory = asyncHandler(async (request, response) => {
  const { name } = request.body;

  if (!name || name.trim().length === 0) {
    throw new AppError("Category name is required", 400);
  }

  const category = await Category.create({
    name: name.trim(),
  });
  // Transform _id to id for frontend consistency
  const transformedCategory = {
    id: category._id.toString(),
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
  return response.status(201).json(transformedCategory);
});

const updateCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const { name } = request.body;

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  if (!name || name.trim().length === 0) {
    throw new AppError("Category name is required", 400);
  }

  const existingCategory = await Category.findById(id);

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  const updatedCategory = await Category.findByIdAndUpdate(id, {
    name: name.trim(),
  }, { new: true });

  // Transform _id to id for frontend consistency
  const transformedCategory = {
    id: updatedCategory._id.toString(),
    name: updatedCategory.name,
    createdAt: updatedCategory.createdAt,
    updatedAt: updatedCategory.updatedAt
  };

  return response.status(200).json(transformedCategory);
});

const deleteCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  const existingCategory = await Category.findById(id);

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  // Check if category has products
  const Product = require('../models/Product');
  const productsWithCategory = await Product.findOne({
    categoryId: id,
  });

  if (productsWithCategory) {
    throw new AppError("Cannot delete category that has products", 400);
  }

  await Category.findByIdAndDelete(id);
  return response.status(204).send();
});

const getCategory = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Category ID is required", 400);
  }

  const category = await Category.findById(id);
  
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Transform _id to id for frontend consistency
  const transformedCategory = {
    id: category._id.toString(),
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };

  return response.status(200).json(transformedCategory);
});

const getAllCategories = asyncHandler(async (request, response) => {
  const categories = await Category.find({});
  // Transform _id to id for frontend consistency
  const transformedCategories = categories.map(category => ({
    id: category._id.toString(),
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  }));
  return response.json(transformedCategories);
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
