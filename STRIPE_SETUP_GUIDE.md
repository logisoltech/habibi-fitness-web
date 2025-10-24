# Stripe Payment Integration Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# Next.js Public Variables (accessible in browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install stripe @stripe/stripe-js
```

### 3. Stripe Dashboard Setup

#### 3.1 Get Your API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your **Publishable key** and **Secret key**
4. Use **Test keys** for development (sk_test_ and pk_test_)

#### 3.2 Set Up Webhook Endpoint
1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events: `checkout.session.completed`
5. Copy the **Signing secret** (starts with whsec_)

### 4. Test the Integration

#### 4.1 Test Cards
Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

#### 4.2 Test Flow
1. Go to `/user-preference`
2. Select meal preferences
3. Choose payment cycle
4. Click "Proceed to Payment"
5. Use test card: 4242 4242 4242 4242
6. Complete payment
7. Verify user is created in your database

## 🔧 Features Implemented

### ✅ Dynamic Pricing
- Calculates price based on selected meals
- Includes delivery fee and VAT
- Updates in real-time as user changes preferences

### ✅ Payment Cycles
- **Weekly**: 7 days
- **Monthly**: 30 days (Popular)
- **Quarterly**: 90 days

### ✅ Stripe Checkout
- Secure payment processing
- Customer information collection
- Shipping address collection
- Metadata storage for user data

### ✅ Webhook Processing
- Automatic user registration after payment
- Meal schedule generation
- Welcome notification sending
- Payment verification

### ✅ Success Page
- Payment confirmation
- Next steps guidance
- Navigation to dashboard

## 📁 Files Created/Modified

### New Files:
- `app/api/stripe/create-checkout-session/route.js` - Creates Stripe checkout sessions
- `app/api/stripe/webhook/route.js` - Handles Stripe webhooks
- `app/api/stripe/verify-session/route.js` - Verifies payment sessions
- `app/payment/success/page.jsx` - Payment success page

### Modified Files:
- `app/user-preference/page.jsx` - Added dynamic pricing and Stripe integration

## 🛠️ Configuration

### Pricing Structure
```javascript
// Base meal prices
const mealTimes = [
  { id: "breakfast", name: "Breakfast", dailyPrice: 20 },
  { id: "lunch", name: "Lunch", dailyPrice: 30 },
  { id: "dinner", name: "Dinner", dailyPrice: 30 },
  { id: "snack", name: "Snack", dailyPrice: 20 },
];

// Additional fees
const deliveryFee = 1; // AED
const vatRate = 0.1; // 10%
```

### Payment Flow
1. User selects preferences → Dynamic pricing calculated
2. User clicks "Proceed to Payment" → Stripe checkout session created
3. User completes payment → Stripe webhook triggered
4. Webhook processes payment → User registered in database
5. User redirected to success page → Can access dashboard

## 🔍 Testing

### Local Testing
1. Start your Next.js app: `npm run dev`
2. Use Stripe CLI for webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Test the complete flow

### Production Testing
1. Update environment variables with live keys
2. Set up production webhook endpoint
3. Test with real payment methods
4. Monitor Stripe dashboard for transactions

## 🚨 Important Notes

### Security
- Never expose secret keys in client-side code
- Always validate webhook signatures
- Use HTTPS in production

### Error Handling
- All API routes include proper error handling
- User-friendly error messages
- Fallback mechanisms for failed payments

### Database Integration
- User data is stored after successful payment
- Meal schedules are automatically generated
- Payment information is tracked

## 📞 Support

If you encounter any issues:
1. Check Stripe dashboard for transaction logs
2. Verify webhook endpoint is receiving events
3. Check server logs for error messages
4. Ensure all environment variables are set correctly

## 🎉 You're All Set!

Your Stripe payment integration is now complete and ready for testing!
