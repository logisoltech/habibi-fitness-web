# 🎯 Stripe Integration Guide for Habibi Fitness

## Overview
This guide will help you set up Stripe for subscription-based meal plan payments in your Habibi Fitness application.

---

## 📋 Prerequisites
- Node.js installed
- Next.js project set up
- A Stripe account (free to create)

---

## 🔐 Part 1: Stripe Account Setup

### Step 1: Create a Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"** or **"Sign in"**
3. Create an account with your email
4. Complete the registration process

### Step 2: Get Your API Keys
1. After logging in, go to **Dashboard**
2. Click on **Developers** in the left sidebar
3. Click on **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"
5. **IMPORTANT**: Copy both keys and save them securely

### Step 3: Create Subscription Products
1. In Stripe Dashboard, click on **Products** in the left sidebar
2. Click **"+ Add product"**
3. Create three products (for your pricing tiers):

#### Product 1: Weekly Subscription
- **Name**: Habibi Fitness - Weekly Plan
- **Description**: Weekly meal plan subscription
- **Pricing**: 
  - Select **"Recurring"**
  - Price: `53.90` AED (or your local currency)
  - Billing period: **Weekly**
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`) - You'll need this

#### Product 2: Monthly Subscription (Popular)
- **Name**: Habibi Fitness - Monthly Plan
- **Description**: Monthly meal plan subscription
- **Pricing**: 
  - Select **"Recurring"**
  - Price: `184.80` AED
  - Billing period: **Monthly**
- Click **"Save product"**
- **Copy the Price ID**

#### Product 3: Quarterly Subscription
- **Name**: Habibi Fitness - 3-Month Plan
- **Description**: 3-month meal plan subscription
- **Pricing**: 
  - Select **"Recurring"**
  - Price: `526.68` AED
  - Billing period: **Every 3 months**
- Click **"Save product"**
- **Copy the Price ID**

### Step 4: Set Up Webhooks (Important!)
Webhooks allow Stripe to notify your server when payments succeed or fail.

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - For local testing: `http://localhost:3000/api/stripe/webhook`
   - For production: Your actual domain
4. **Events to listen to**:
   - `checkout.session.completed` ✅
   - `customer.subscription.created` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.paid` ✅
   - `invoice.payment_failed` ✅
5. Click **"Add endpoint"**
6. **Copy the Webhook Secret** (starts with `whsec_...`) - You'll need this

---

## 🔧 Part 2: Local Development Setup

### Step 1: Install Stripe Package
```bash
npm install stripe @stripe/stripe-js
```

### Step 2: Add Environment Variables
Create or update your `.env.local` file in the project root:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (from products you created)
STRIPE_PRICE_WEEKLY=price_your_weekly_price_id
STRIPE_PRICE_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_QUARTERLY=price_your_quarterly_price_id

# Your domain (for redirects)
NEXT_PUBLIC_DOMAIN=http://localhost:3000
```

### Step 3: Testing Webhooks Locally (Optional but Recommended)
To test webhooks on localhost:

1. Install Stripe CLI:
   ```bash
   # Windows (using Chocolatey)
   choco install stripe-cli
   
   # Mac (using Homebrew)
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   This will give you a webhook signing secret - add it to `.env.local`

---

## 💳 Part 3: Testing Stripe Payments

### Test Card Numbers
Stripe provides test card numbers for development:

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Card Declined:**
- Card Number: `4000 0000 0000 0002`

**Insufficient Funds:**
- Card Number: `4000 0000 0000 9995`

**3D Secure Authentication Required:**
- Card Number: `4000 0025 0000 3155`

More test cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## 🚀 Part 4: Going Live (Production)

### Step 1: Complete Stripe Account Verification
1. In Stripe Dashboard, click **"Activate your account"**
2. Provide business details:
   - Business type
   - Business address
   - Bank account details (for payouts)
   - Tax information
3. Submit for review (usually approved within 24-48 hours)

### Step 2: Switch to Live Mode
1. In Stripe Dashboard, toggle from **Test mode** to **Live mode** (top right)
2. Get your **Live API keys**:
   - Go to **Developers** → **API keys**
   - Copy the **Live** publishable and secret keys
3. Update production environment variables with live keys

### Step 3: Update Production Webhooks
1. Create a new webhook endpoint with your production URL
2. Copy the new webhook secret
3. Update production environment variables

---

## 📊 Part 5: Managing Subscriptions

### View Subscriptions
- Dashboard → **Customers** → Select customer → View subscriptions

### Cancel Subscriptions
- Dashboard → **Subscriptions** → Select subscription → **Cancel**

### Issue Refunds
- Dashboard → **Payments** → Select payment → **Refund**

### View Reports
- Dashboard → **Reports** → View revenue, subscriptions, etc.

---

## 🔒 Security Best Practices

1. ✅ **Never expose secret keys** - Only use them server-side
2. ✅ **Always verify webhook signatures** - Prevents fake webhook calls
3. ✅ **Use HTTPS in production** - Required for PCI compliance
4. ✅ **Store minimal card data** - Let Stripe handle sensitive data
5. ✅ **Validate webhook events** - Check event types before processing
6. ✅ **Handle idempotency** - Webhooks can be sent multiple times

---

## 🐛 Troubleshooting

### Webhook not receiving events
- Check webhook URL is publicly accessible
- Verify webhook secret is correct
- Check Stripe Dashboard → Webhooks → Event logs

### Payment not completing
- Check Stripe Dashboard → Payments → See error messages
- Verify price IDs are correct
- Ensure test mode vs live mode consistency

### User not registered after payment
- Check webhook is receiving `checkout.session.completed` event
- Verify webhook handler is creating user correctly
- Check server logs for errors

---

## 📚 Additional Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Test Mode**: Toggle in top-right of dashboard
- **Support**: [https://support.stripe.com](https://support.stripe.com)

---

## 📞 Support

If you encounter any issues:
1. Check Stripe Dashboard logs
2. Check your application logs
3. Review this guide
4. Contact Stripe support: [https://support.stripe.com](https://support.stripe.com)

---

## ✅ Checklist

Before going live:
- [ ] Stripe account created and verified
- [ ] Products and prices created
- [ ] API keys added to environment variables
- [ ] Webhooks configured and tested
- [ ] Test payments completed successfully
- [ ] Production webhook endpoint set up
- [ ] Live API keys configured in production
- [ ] SSL certificate installed (HTTPS)
- [ ] Error handling tested
- [ ] Subscription cancellation flow tested

---

**Good luck with your integration! 🚀**


