const CustomerOrder = require('../models/CustomerOrder');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require("../utills/errorHandler");

const createOrderProduct = asyncHandler(async (request, response) => {
  const { customerOrderId, productId, quantity } = request.body;
  
  // Validate required fields
  if (!customerOrderId) {
    throw new AppError("Customer order ID is required", 400);
  }
  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }
  if (!quantity || quantity <= 0) {
    throw new AppError("Valid quantity is required", 400);
  }

  // Verify that the customer order exists
  const existingOrder = await CustomerOrder.findById(customerOrderId);

  if (!existingOrder) {
    throw new AppError("Customer order not found", 404);
  }

  // Verify that the product exists
  const existingProduct = await Product.findById(productId);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  // Check if product already exists in order
  const existingProductInOrder = existingOrder.products.find(
    p => p.productId.toString() === productId
  );

  if (existingProductInOrder) {
    // Update quantity if product already in order
    existingProductInOrder.quantity += parseInt(quantity);
  } else {
    // Add new product to order
    existingOrder.products.push({
      productId: productId,
      quantity: parseInt(quantity),
      productSnapshot: {
        title: existingProduct.title,
        price: existingProduct.price,
        mainImage: existingProduct.mainImage
      }
    });
  }

  await existingOrder.save();

  return response.status(201).json({
    customerOrderId,
    productId,
    quantity: parseInt(quantity)
  });
});

const updateProductOrder = asyncHandler(async (request, response) => {
  const { orderId, productId } = request.params;
  const { quantity } = request.body;

  if (!orderId || !productId) {
    throw new AppError("Order ID and Product ID are required", 400);
  }

  if (!quantity || quantity <= 0) {
    throw new AppError("Valid quantity is required", 400);
  }

  const existingOrder = await CustomerOrder.findById(orderId);

  if (!existingOrder) {
    throw new AppError("Order not found", 404);
  }

  // Find the product in the order
  const productIndex = existingOrder.products.findIndex(
    p => p.productId.toString() === productId
  );

  if (productIndex === -1) {
    throw new AppError("Product not found in order", 404);
  }

  // Update quantity
  existingOrder.products[productIndex].quantity = parseInt(quantity);

  await existingOrder.save();

  return response.status(200).json({
    orderId,
    productId,
    quantity: parseInt(quantity)
  });
});

const deleteProductOrder = asyncHandler(async (request, response) => {
  const { orderId, productId } = request.params;

  if (!orderId || !productId) {
    throw new AppError("Order ID and Product ID are required", 400);
  }

  const existingOrder = await CustomerOrder.findById(orderId);

  if (!existingOrder) {
    throw new AppError("Order not found", 404);
  }

  // Find and remove the product from the order
  const productIndex = existingOrder.products.findIndex(
    p => p.productId.toString() === productId
  );

  if (productIndex === -1) {
    throw new AppError("Product not found in order", 404);
  }

  existingOrder.products.splice(productIndex, 1);
  await existingOrder.save();

  return response.status(204).send();
});

const getProductOrder = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Order ID is required", 400);
  }

  const order = await CustomerOrder.findById(id).populate('products.productId');

  if (!order) {
    throw new AppError("Order not found", 404);
  }
  
  return response.status(200).json(order.products);
});

const getAllProductOrders = asyncHandler(async (request, response) => {
  const orders = await CustomerOrder.find({}).populate('products.productId');

  // Flatten the products from all orders
  const productOrders = [];
  for (const order of orders) {
    for (const productItem of order.products) {
      productOrders.push({
        productId: productItem.productId._id,
        quantity: productItem.quantity,
        customerOrder: {
          id: order._id,
          name: order.name,
          lastname: order.lastname,
          phone: order.phone,
          email: order.email,
          company: order.company,
          adress: order.adress,
          apartment: order.apartment,
          postalCode: order.postalCode,
          dateTime: order.dateTime,
          status: order.status,
          total: order.total
        },
        product: productItem.productId
      });
    }
  }

  return response.status(200).json(productOrders);
});

module.exports = { 
  createOrderProduct, 
  updateProductOrder, 
  deleteProductOrder, 
  getProductOrder,
  getAllProductOrders
};