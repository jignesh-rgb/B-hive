const express = require("express");
const path = require('path');
// Load env from server/.env then fallback to project root .env
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const fileUpload = require("express-fileupload");
const productsRouter = require("./routes/products");
const productImagesRouter = require("./routes/productImages");
const categoryRouter = require("./routes/category");
const searchRouter = require("./routes/search");
const mainImageRouter = require("./routes/mainImages");
const userRouter = require("./routes/users");
const orderRouter = require("./routes/customer_orders");
const slugRouter = require("./routes/slugs");
const orderProductRouter = require('./routes/customer_order_product');
// const wishlistRouter = require('./routes/wishlist');
const cartRouter = require('./routes/cart');
const notificationsRouter = require('./routes/notifications');
console.log('notificationsRouter loaded');
const merchantRouter = require('./routes/merchant'); // Add this line
console.log('merchantRouter loaded');
const bulkUploadRouter = require('./routes/bulkUpload');
console.log('bulkUploadRouter loaded');
const paymentsRouter = require('./routes/payments');
console.log('paymentsRouter loaded');
var cors = require("cors");

// Import logging middleware
const { 
  addRequestId, 
  requestLogger, 
  errorLogger, 
  securityLogger 
} = require('./middleware/requestLogger');

// Import rate limiting middleware
const {
  generalLimiter,
  authLimiter,
  registerLimiter,
  userManagementLimiter,
  uploadLimiter,
  searchLimiter,
  orderLimiter
} = require('./middleware/rateLimiter');

const {
  handleServerError
} = require('./utills/errorHandler');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Add request ID to all requests
app.use(addRequestId);

// Security logging (check for suspicious patterns)
app.use(securityLogger);

// Standard request logging
app.use(requestLogger);

// Error logging (only logs 4xx and 5xx responses)
app.use(errorLogger);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXTAUTH_URL,
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values
console.log('Allowed origins:', allowedOrigins);

// CORS configuration with origin validation
const corsOptions = {
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);
    

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    

    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Reject other origins
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies and authorization headers
};
console.log('CORS options configured');

// Apply general rate limiting to all routes
app.use(generalLimiter);

app.use(express.json());
app.use(cors(corsOptions));
app.use(fileUpload());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply specific rate limiters to different route groups
app.use("/api/users", userManagementLimiter);
app.use("/api/search", searchLimiter);
app.use("/api/orders", orderLimiter);
app.use("/api/order-product", orderLimiter);
app.use("/api/images", uploadLimiter);
app.use("/api/main-image", uploadLimiter);
app.use("/api/merchants", (req, res, next) => next()); // Temporarily bypass rate limiting for merchants
app.use("/api/bulk-upload", uploadLimiter);

// Apply stricter rate limiting to authentication-related routes
app.use("/api/users/email", authLimiter); // For login attempts via email lookup

// Apply admin rate limiting to admin routes


app.use("/api/products", productsRouter);
// console.log('Products router added');
app.use("/api/categories", categoryRouter);
// console.log('Categories router added');
app.use("/api/images", productImagesRouter);
// console.log('Product images router added');
app.use("/api/main-image", mainImageRouter);
// console.log('Main image router added');
app.use("/api/users", userRouter);
// console.log('Users router added');
app.use("/api/search", searchRouter);
// console.log('Search router added');
app.use("/api/orders", orderRouter);
// console.log('Orders router added');
app.use('/api/order-product', orderProductRouter);
// console.log('Order product router added');
app.use("/api/slugs", slugRouter);
// console.log('Slugs router added');
app.use("/api/notifications", notificationsRouter);
// console.log('Notifications router added');
app.use("/api/cart", cartRouter);
// console.log('Cart router added');
app.use("/api/merchants", merchantRouter); 
// console.log('Merchants router added');
app.use("/api/bulk-upload", bulkUploadRouter);
// console.log('Bulk upload router added');
app.use("/api/payments", paymentsRouter);
// console.log('Payments router added');

// Add a simple test route
app.get('/test', (req, res) => {
  console.log('Test route called');
  res.json({ message: 'Test route works' });
});
console.log('Test route added');

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    rateLimiting: 'enabled',
    requestId: req.reqId
  });
});

// Rate limit info endpoint
app.get('/rate-limit-info', (req, res) => {
  res.status(200).json({
    general: '100 requests per 15 minutes',
    auth: '5 login attempts per 15 minutes',
    register: '3 registrations per hour',
    upload: '10 uploads per 15 minutes',
    search: '30 searches per minute',
    orders: '15 order operations per 15 minutes',
    wishlist: '20 operations per 5 minutes',
    products: '60 requests per minute',
    requestId: req.reqId
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requestId: req.reqId
  });
});

// Global error handler
app.use((err, req, res, next) => {
  handleServerError(err, res, `${req.method} ${req.path}`);
});

const PORT = process.env.PORT || 5001;

// Global error handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  // Don't exit the process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Connect to MongoDB
const { connectDB } = require('./utills/db');
connectDB().then(() => {
  console.log('Starting HTTP server...');
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Rate limiting and request logging enabled for all endpoints');
    console.log('Logs are being written to server/logs/ directory');
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  server.on('listening', () => {
    console.log('Server is now listening on port', PORT);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

module.exports = app;
