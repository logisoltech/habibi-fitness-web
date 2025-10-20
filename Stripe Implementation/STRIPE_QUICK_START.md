# 🚀 Stripe Quick Start Guide

## Installation & Setup (5 minutes)

### 1. Install Stripe Package
```bash
npm install stripe @stripe/stripe-js
```

### 2. Create Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

### 3. Get Stripe API Keys
1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy **Publishable key** (pk_test_...)
3. Copy **Secret key** (sk_test_...) - Click "Reveal test key"
4. Paste them in `.env.local`

### 4. Create Products in Stripe
1. Go to [https://dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"**
3. Create 3 products:

**Weekly Plan:**
- Name: Habibi Fitness - Weekly Plan
- Pricing: Recurring → 53.90 AED → Weekly
- Copy the **Price ID** (price_...)

**Monthly Plan:**
- Name: Habibi Fitness - Monthly Plan
- Pricing: Recurring → 184.80 AED → Monthly
- Copy the **Price ID**

**Quarterly Plan:**
- Name: Habibi Fitness - 3-Month Plan
- Pricing: Recurring → 526.68 AED → Every 3 months
- Copy the **Price ID**

4. Add all three Price IDs to `.env.local`

### 5. Set Up Webhooks
1. Go to [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"+ Add endpoint"**
3. Endpoint URL: `http://localhost:3000/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (whsec_...)
6. Add it to `.env.local`

### 6. Test Payment
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go through the registration flow:
   - Sign up → Onboarding → Goals → User Preference

3. Click **"Proceed to Payment"**

4. Use test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

5. Complete payment → User should be registered!

---

## 🧪 Testing Webhooks Locally

### Install Stripe CLI
```bash
# Windows
choco install stripe-cli

# Mac
brew install stripe/stripe-cli/stripe
```

### Forward Webhooks to Local Server
```bash
# Login to Stripe
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook signing secret - update `.env.local` with it.

---

## 📊 Flow Overview

```
User fills preferences
     ↓
Click "Proceed to Payment"
     ↓
Create Stripe Checkout Session (with user data in metadata)
     ↓
Redirect to Stripe Checkout Page
     ↓
User enters card details
     ↓
Stripe processes payment
     ↓
On success: webhook receives checkout.session.completed
     ↓
Webhook extracts user data from metadata
     ↓
Webhook registers user in database
     ↓
User redirected to success page
     ↓
User auto-logged in and redirected to dashboard
```

---

## 🔍 Verification Checklist

- [ ] Stripe packages installed
- [ ] `.env.local` created with all keys
- [ ] 3 products created in Stripe Dashboard
- [ ] Price IDs added to `.env.local`
- [ ] Webhook endpoint created
- [ ] Webhook secret added to `.env.local`
- [ ] Test payment completed successfully
- [ ] User registered in database after payment
- [ ] User redirected to success page

---

## 🐛 Troubleshooting

**Payment not completing?**
- Check browser console for errors
- Verify all environment variables are set
- Check Stripe Dashboard → Logs for errors

**User not registered?**
- Check webhook is receiving events (Stripe Dashboard → Webhooks → Events)
- Check server logs for webhook handler errors
- Verify API_BASE_URL is correct in webhook route

**Redirect not working?**
- Verify NEXT_PUBLIC_DOMAIN is set correctly
- Check browser console for redirect errors

---

## 📚 Need More Help?

See the full guide: [STRIPE_INTEGRATION_GUIDE.md](./STRIPE_INTEGRATION_GUIDE.md)


