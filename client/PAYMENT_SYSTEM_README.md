# B-hive Payment System Documentation

## Overview

The B-hive ecommerce platform supports a comprehensive payment system with two primary payment methods:

1. **Cash on Delivery (COD)** - Payment collected upon delivery
2. **Online Payment** - Secure payment via Razorpay gateway

## Supported Payment Methods

### 1. Cash on Delivery (COD)
- **Description**: Customer pays when the order is delivered
- **Order Status**: `processing` (ready for fulfillment)
- **Payment Status**: `paid` (considered paid since no payment required upfront)
- **Flow**: Order → Processing → Shipping → Delivery → COD Payment

### 2. Online Payment (Razorpay)
- **Description**: Secure online payment through Razorpay
- **Supported Payment Options**:
  - Credit/Debit Cards (Visa, Mastercard, American Express, etc.)
  - UPI (Google Pay, PhonePe, Paytm, etc.)
  - Net Banking
  - Digital Wallets
  - EMI options
- **Order Status Flow**:
  - `pending` (awaiting payment)
  - `processing` (payment successful, ready for fulfillment)
  - `shipped` → `delivered`
- **Payment Status Flow**:
  - `pending` (payment initiated)
  - `paid` (payment successful)
  - `failed` (payment failed)

## Technical Implementation

### Database Schema

```javascript
// CustomerOrder Model
{
  // ... other fields
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  // ... other fields
}
```

### API Endpoints

#### Orders
- `POST /api/orders` - Create new order with payment method

#### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify-payment` - Verify payment signature
- `GET /api/payments/status/:orderId` - Get payment status

### Frontend Implementation

#### Checkout Flow
1. User fills order details
2. Selects payment method (COD or Online)
3. For COD: Order created immediately, success message shown
4. For Online: Order created, Razorpay modal opens, payment processed

#### Razorpay Integration
- SDK loaded via CDN in `app/layout.tsx`
- Payment modal configured with order details
- Success/failure handlers manage order status
- Signature verification ensures payment security

### Environment Variables

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Security Features

1. **Signature Verification**: All payments verified using HMAC-SHA256
2. **Order Validation**: Prevents duplicate payments and invalid states
3. **Input Sanitization**: All payment data validated and sanitized
4. **Error Handling**: Comprehensive error handling for all failure scenarios

## Testing

### Automated Tests
Run the payment system test:
```bash
cd server
node test-payment.js
```

### Manual Testing

#### COD Order
1. Add items to cart
2. Go to checkout
3. Fill form, select "Cash on Delivery"
4. Submit order
5. Verify order status: `processing`, payment status: `paid`

#### Online Payment
1. Add items to cart
2. Go to checkout
3. Fill form, select "Online Payment"
4. Submit order
5. Razorpay modal opens (requires valid API keys for testing)
6. Complete payment flow
7. Verify order status: `processing`, payment status: `paid`

## Production Deployment

### Razorpay Setup
1. Create Razorpay account
2. Get API keys from dashboard
3. Replace environment variables with live keys
4. Configure webhook for payment confirmations (optional)

### Security Checklist
- [ ] Use live Razorpay keys in production
- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up monitoring for payment failures
- [ ] Implement rate limiting on payment endpoints

## Error Handling

### Common Error Scenarios
1. **Payment Timeout**: User closes payment modal before completion
2. **Network Issues**: Connection lost during payment
3. **Invalid Cards**: Card declined by bank
4. **Signature Mismatch**: Payment verification fails

### Error Recovery
- Failed payments update order status to `failed`
- Users can retry payment or choose different method
- Admin can manually update order status if needed

## Future Enhancements

### Potential Additions
1. **Partial Payments**: Allow customers to pay part online, rest COD
2. **Payment Plans**: EMI and installment options
3. **Multi-currency**: Support for international payments
4. **Payment Links**: Send payment links via email/SMS
5. **Refund Management**: Automated refund processing

### Additional Gateways
- Stripe
- PayPal
- PayU
- CCAvenue

## Support

For payment-related issues:
1. Check Razorpay dashboard for transaction details
2. Verify API keys are correct
3. Check server logs for error details
4. Test with Razorpay's sandbox environment</content>
<parameter name="filePath">D:\Projects\B-hive\PAYMENT_SYSTEM_README.md