import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentCycle, userEmail, userName, userData, pricing, amount, currency, description, metadata } = body || {};

    // Support both legacy payload (pricing + userData) and simplified payload (amount/currency/description/metadata)
    const selectedPricing = pricing || (amount && currency ? { amount, currency, description: description || 'Subscription' } : null);

    // Build product display details safely
    const planName = userData?.plan || metadata?.subscription || 'Subscription';
    const mealCount = userData?.mealcount || metadata?.mealCount || '';
    const selectedDaysText = userData?.selecteddays ? `${userData.selecteddays.length} days/week` : '';

    console.log('🛒 Creating Stripe checkout session for:', {
      paymentCycle,
      userEmail,
      userName,
      planName,
      amount: selectedPricing?.amount,
      currency: selectedPricing?.currency,
    });

    // Use provided pricing or fallback to default
    const finalPricing = selectedPricing || {
      amount: 5390, // Default fallback
      currency: 'aed',
      description: 'Meal Plan'
    };

    if (!finalPricing.amount || !finalPricing.currency) {
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
            currency: finalPricing.currency,
            product_data: {
              name: `Habibi Fitness - ${planName}`,
              description: `${mealCount ? mealCount + ' meals, ' : ''}${selectedDaysText}${selectedDaysText && finalPricing.description ? ' - ' : ''}${finalPricing.description || ''}`.trim(),
              images: ['https://habibi-fitness-web.vercel.app/images/logo-green.png'],
            },
            unit_amount: finalPricing.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://habibi-fitness-web.vercel.app/payment/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://habibi-fitness-web.vercel.app/user-preference',
      customer_email: userEmail,
      metadata: {
        ...(metadata || {}),
        plan: userData?.plan || metadata?.plan || planName,
        mealCount: userData?.mealcount || metadata?.mealCount || '',
        selectedDays: userData?.selecteddays ? JSON.stringify(userData.selecteddays) : (metadata?.selectedDays || ''),
        subscription: userData?.subscription || metadata?.subscription || '',
        paymentCycle: paymentCycle || metadata?.paymentCycle || '',
        ...(userData ? { userData: JSON.stringify(userData) } : {}),
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