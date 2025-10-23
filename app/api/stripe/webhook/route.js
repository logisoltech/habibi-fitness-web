import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// API endpoint for your backend to register users
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://habibi-fitness-server.onrender.com/api';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!webhookSecret) {
      console.error('⚠️ Stripe webhook secret is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`✅ Received Stripe event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('💰 Payment successful!', session.id);
        
        // Extract user data from metadata
        const metadata = session.metadata;
        
        if (metadata && metadata.userPhone) {
          // Prepare user registration data
          const userData = {
            name: metadata.userName,
            phone: metadata.userPhone,
            address: metadata.userAddress,
            activity: metadata.userActivity,
            plan: metadata.userPlan,
            goal: metadata.userGoal,
            weight: metadata.userWeight,
            height: metadata.userHeight,
            age: metadata.userAge,
            gender: metadata.userGender,
            mealcount: metadata.userMealCount,
            mealtypes: JSON.parse(metadata.userMealTypes || '[]'),
            selecteddays: JSON.parse(metadata.userSelectedDays || '[]'),
            subscription: metadata.userSubscription,
            bmi: metadata.userBMI,
            tdee: metadata.userTDEE,
            allergies: JSON.parse(metadata.userAllergies || '[]'),
            // Payment info
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            paymentStatus: 'paid',
          };

          console.log('📋 Registering user with data:', userData);

          // Register user in database
          try {
            const response = await fetch(`${API_BASE_URL}/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (result.success) {
              console.log('✅ User registered successfully:', result.data);
            } else {
              console.error('❌ User registration failed:', result.message);
            }
          } catch (error) {
            console.error('❌ Error registering user:', error);
          }
        } else {
          console.warn('⚠️ No user metadata found in session');
        }
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('🔔 New subscription created:', subscription.id);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('🔔 Subscription updated:', updatedSubscription.id);
        // Handle subscription updates (e.g., plan changes)
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('🔔 Subscription cancelled:', deletedSubscription.id);
        // Handle subscription cancellation
        break;

      case 'invoice.paid':
        const invoice = event.data.object;
        console.log('💵 Invoice paid:', invoice.id);
        // Handle successful recurring payment
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('❌ Payment failed for invoice:', failedInvoice.id);
        // Handle failed payment (e.g., send notification to user)
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks - Stripe needs raw body
export const config = {
  api: {
    bodyParser: false,
  },
};


