import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      priceId, 
      paymentCycle,
      userEmail,
      userName,
      userData // All the user registration data
    } = body;

    // Validate required fields
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Map payment cycle to price IDs from environment variables
    const priceMapping = {
      weekly: process.env.STRIPE_PRICE_WEEKLY,
      monthly: process.env.STRIPE_PRICE_MONTHLY,
      quarterly: process.env.STRIPE_PRICE_QUARTERLY,
    };

    const stripePriceId = priceMapping[paymentCycle] || priceId;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // Subscription-based payment
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/payment/cancel`,
      customer_email: userEmail || undefined,
      client_reference_id: userData?.phone || undefined, // Use phone as reference
      metadata: {
        // Store user data in metadata to retrieve after payment
        userName: userName || userData?.name || '',
        userPhone: userData?.phone || '',
        userAddress: userData?.address || '',
        userActivity: userData?.activity || '',
        userPlan: userData?.plan || '',
        userGoal: userData?.goal || '',
        userWeight: userData?.weight?.toString() || '',
        userHeight: userData?.height?.toString() || '',
        userAge: userData?.age?.toString() || '',
        userGender: userData?.gender || '',
        userMealCount: userData?.mealcount?.toString() || '',
        userMealTypes: JSON.stringify(userData?.mealtypes || []),
        userSelectedDays: JSON.stringify(userData?.selecteddays || []),
        userSubscription: userData?.subscription || paymentCycle,
        userBMI: userData?.bmi || '',
        userTDEE: userData?.tdee || '',
        userAllergies: JSON.stringify(userData?.allergies || []),
      },
      subscription_data: {
        metadata: {
          // Also store in subscription metadata
          userPhone: userData?.phone || '',
          userName: userName || userData?.name || '',
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}


