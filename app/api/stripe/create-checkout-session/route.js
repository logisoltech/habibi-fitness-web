import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { paymentCycle, userEmail, userName, userData, pricing } = await request.json();

    console.log('🛒 Creating Stripe checkout session for:', {
      paymentCycle,
      userEmail,
      userName,
      userData: {
        plan: userData.plan,
        mealcount: userData.mealcount,
        selecteddays: userData.selecteddays,
        subscription: userData.subscription
      }
    });

    // Use provided pricing or fallback to default
    const selectedPricing = pricing || {
      amount: 5390, // Default fallback
      currency: 'aed',
      description: 'Meal Plan'
    };

    if (!selectedPricing.amount || !selectedPricing.currency) {
      return NextResponse.json(
        { error: 'Invalid pricing data' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: selectedPricing.currency,
            product_data: {
              name: `Habibi Fitness - ${userData.plan} Plan`,
              description: `${userData.mealcount} meals, ${userData.selecteddays.length} days/week - ${selectedPricing.description}`,
              images: ['https://habibi-fitness-web.vercel.app/images/logo-green.png'],
            },
            unit_amount: selectedPricing.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: '/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: '/user-preference',
      customer_email: userEmail,
      metadata: {
        userId: userData.phone, // Using phone as user identifier
        plan: userData.plan,
        mealCount: userData.mealcount,
        selectedDays: JSON.stringify(userData.selecteddays),
        subscription: userData.subscription,
        paymentCycle: paymentCycle,
        // Store complete user data for registration after payment
        userData: JSON.stringify(userData)
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['AE', 'SA', 'KW', 'QA', 'BH', 'OM'], // UAE and neighboring countries
      },
    });

    console.log('✅ Stripe checkout session created:', session.id);

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Error creating Stripe checkout session:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}