const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const CustomerOrder = require('../models/CustomerOrder');
const { validateOrderData } = require('../utills/validation');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', orderId } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Invalid amount',
                message: 'Amount must be greater than 0'
            });
        }

        // Find the order to ensure it exists
        const order = await CustomerOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                message: 'Order does not exist'
            });
        }

        // Check if order is eligible for payment
        if (order.paymentMethod !== 'online') {
            return res.status(400).json({
                error: 'Invalid payment method',
                message: 'This order does not require online payment'
            });
        }

        // Check if order already has a Razorpay order ID
        if (order.razorpayOrderId) {
            return res.status(400).json({
                error: 'Order already processed',
                message: 'Payment order already created for this order'
            });
        }

        // Check if payment is already completed
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                error: 'Payment already completed',
                message: 'This order has already been paid'
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paisa
            currency,
            receipt: `order_${orderId}`,
            payment_capture: 1, // Auto capture
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Update order with Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.json({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            error: 'Failed to create payment order',
            message: error.message
        });
    }
});

// Get payment status for an order
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await CustomerOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                message: 'Order does not exist'
            });
        }

        res.json({
            orderId: order._id,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.status,
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: order.razorpayPaymentId
        });

    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({
            error: 'Failed to fetch payment status',
            message: error.message
        });
    }
});

// Verify Razorpay payment
router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
        } = req.body;

        // 1️⃣ Validate request
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !orderId
        ) {
            return res.status(400).json({
                error: 'Missing payment details',
                message: 'Incomplete payment verification data',
            });
        }

        // 2️⃣ Find order
        const order = await CustomerOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
                message: 'Order does not exist',
            });
        }

        // 3️⃣ Verify signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                error: 'Invalid signature',
                message: 'Payment verification failed',
            });
        }

        // 4️⃣ Update order as PAID
        order.paymentStatus = 'paid';
        order.status = 'confirmed'; // or 'processing'
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpayOrderId = razorpay_order_id;

        await order.save();

        // 5️⃣ Success response
        res.json({
            success: true,
            message: 'Payment verified successfully',
            orderId: order._id,
            paymentId: razorpay_payment_id,
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            error: 'Payment verification failed',
            message: error.message,
        });
    }
});


module.exports = router;