const express = require('express');
const router = express.Router();

const {
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cart');

// Get user's cart
router.get('/:userId', getUserCart);

// Add item to cart
router.post('/:userId', addToCart);

// Update cart item quantity
router.put('/:userId/:productId', updateCartItem);

// Remove item from cart
router.delete('/:userId/:productId', removeFromCart);

// Clear cart
router.delete('/:userId', clearCart);

module.exports = router;