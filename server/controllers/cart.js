const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, AppError } = require('../utills/errorHandler');

// Get user's cart
const getUserCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const cartItems = await Cart.find({ userId })
    .populate('productId', 'title price mainImage slug')
    .sort({ createdAt: -1 });

  // Transform data to match frontend expectations
  const transformedItems = cartItems.map(item => ({
    id: item.productId._id.toString(),
    title: item.productId.title,
    price: item.productId.price,
    image: item.productId.mainImage,
    amount: item.quantity
  }));

  // Calculate totals
  const allQuantity = transformedItems.reduce((sum, item) => sum + item.amount, 0);
  const total = transformedItems.reduce((sum, item) => sum + (item.amount * item.price), 0);

  res.json({
    products: transformedItems,
    allQuantity,
    total
  });
});

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity = 1 } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if item already in cart
  let cartItem = await Cart.findOne({ userId, productId });

  if (cartItem) {
    // Update quantity
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    // Create new cart item
    cartItem = await Cart.create({
      userId,
      productId,
      quantity
    });
  }

  res.status(201).json({
    message: 'Item added to cart',
    cartItem: {
      id: cartItem.productId.toString(),
      quantity: cartItem.quantity
    }
  });
});

// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  const cartItem = await Cart.findOne({ userId, productId });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  cartItem.quantity = quantity;
  await cartItem.save();

  res.json({
    message: 'Cart item updated',
    cartItem: {
      productId: cartItem.productId,
      quantity: cartItem.quantity
    }
  });
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  const { userId, productId } = req.params;

  const cartItem = await Cart.findOneAndDelete({ userId, productId });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  res.json({
    message: 'Item removed from cart'
  });
});

// Clear user's cart
const clearCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  await Cart.deleteMany({ userId });

  res.json({
    message: 'Cart cleared'
  });
});

module.exports = {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};