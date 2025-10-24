import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_KEY;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      console.log('⚠️ No webhook secret configured, skipping signature verification');
      // For testing without webhook secret, we'll parse the body directly
      try {
        event = JSON.parse(body);
      } catch (err) {
        console.error('❌ Failed to parse webhook body:', err.message);
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    }

    console.log('🔔 Received Stripe webhook event:', event.type);

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('✅ Payment successful for session:', session.id);
      console.log('📧 Customer email:', session.customer_email);
      console.log('💰 Amount paid:', session.amount_total);
      console.log('📋 Metadata:', session.metadata);

      // Extract user data from metadata
      const userData = JSON.parse(session.metadata.userData);
      const userId = session.metadata.userId;

      try {
        // Register the user in your database
        const registrationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://habibi-fitness-server.onrender.com'}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            email: session.customer_email,
            address: session.shipping?.address ? 
              `${session.shipping.address.line1}, ${session.shipping.address.city}, ${session.shipping.address.country}` : 
              userData.address,
            plan: userData.plan,
            goal: userData.goal,
            weight: userData.weight,
            height: userData.height,
            age: userData.age,
            gender: userData.gender,
            mealtypes: JSON.stringify(userData.mealtypes),
            selecteddays: JSON.stringify(userData.selecteddays),
            subscription: userData.subscription,
            bmi: userData.bmi,
            tdee: userData.tdee,
            allergies: JSON.stringify(userData.allergies || []),
            // Payment information
            payment_status: 'paid',
            stripe_customer_id: session.customer,
            stripe_session_id: session.id,
            payment_amount: session.amount_total,
            payment_currency: session.currency,
            payment_cycle: userData.subscription,
            paid_at: new Date().toISOString()
          }),
        });

        const registrationResult = await registrationResponse.json();

        if (registrationResult.success) {
          console.log('✅ User registered successfully:', registrationResult.data.id);
          
          // Generate meal schedule for the user
          try {
            const scheduleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://habibi-fitness-server.onrender.com'}/api/schedule/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: registrationResult.data.id,
                weeks: 4 // Generate 4 weeks of meals
              }),
            });

            const scheduleResult = await scheduleResponse.json();
            
            if (scheduleResult.success) {
              console.log('✅ Meal schedule generated for user:', registrationResult.data.id);
            } else {
              console.error('❌ Failed to generate meal schedule:', scheduleResult.error);
            }
          } catch (scheduleError) {
            console.error('❌ Error generating meal schedule:', scheduleError);
          }

          // Send welcome notification
          try {
            const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://habibi-fitness-server.onrender.com'}/api/notifications/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: 'Welcome to Habibi Fitness! 🎉',
                message: `Your ${userData.plan} meal plan is ready! Check your personalized meal schedule in the app.`,
                target: 'specific',
                userIds: [registrationResult.data.id],
                type: 'welcome',
                priority: 'high'
              }),
            });

            const notificationResult = await notificationResponse.json();
            if (notificationResult.success) {
              console.log('✅ Welcome notification sent');
            }
          } catch (notificationError) {
            console.error('❌ Error sending welcome notification:', notificationError);
          }

        } else {
          console.error('❌ Failed to register user:', registrationResult.error);
        }

      } catch (dbError) {
        console.error('❌ Database error during user registration:', dbError);
      }
    }

    // Handle payment failed
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      console.log('⏰ Checkout session expired:', session.id);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}