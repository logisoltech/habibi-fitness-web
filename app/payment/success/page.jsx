'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { font } from '../../components/font/font';

function PaymentSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [userRegistered, setUserRegistered] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setError('No payment session found');
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setPaymentDetails(data.session);
        
        // Register user directly since webhook isn't working
        await registerUserAfterPayment(data.session);
      } else {
        setError(data.error || 'Failed to verify payment');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const registerUserAfterPayment = async (session) => {
    try {
      console.log('🔄 Registering user after payment...');
      
      // Extract user data from session metadata
      const userData = JSON.parse(session.metadata.userData);
      const userId = session.metadata.userId;

      console.log('📋 User data from payment:', userData);
      console.log('📋 User allergies:', userData.allergies, typeof userData.allergies);

      // Ensure allergies is always an array
      let allergiesArray = [];
      if (Array.isArray(userData.allergies)) {
        allergiesArray = userData.allergies;
      } else if (typeof userData.allergies === 'string') {
        try {
          allergiesArray = JSON.parse(userData.allergies);
        } catch (e) {
          console.log('⚠️ Failed to parse allergies string:', userData.allergies);
          allergiesArray = [];
        }
      }

      console.log('📋 Processed allergies array:', allergiesArray);

      // Ensure mealtypes and selecteddays are arrays
      let mealtypesArray = Array.isArray(userData.mealtypes) ? userData.mealtypes : [];
      let selecteddaysArray = Array.isArray(userData.selecteddays) ? userData.selecteddays : [];

      console.log('📋 Processed mealtypes:', mealtypesArray);
      console.log('📋 Processed selecteddays:', selecteddaysArray);

      // Prepare registration data - only include essential fields that exist in the database
      const registrationData = {
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        plan: userData.plan,
        goal: userData.goal,
        weight: userData.weight,
        height: userData.height,
        age: userData.age,
        gender: userData.gender,
        mealtypes: mealtypesArray, // Use processed array
        selecteddays: selecteddaysArray, // Use processed array
        subscription: userData.subscription,
        bmi: userData.bmi,
        tdee: userData.tdee,
        allergies: allergiesArray // Use processed allergies array
      };

      console.log('📋 Registration data being sent:', registrationData);

      // Register the user in your database
      const registrationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://habibi-fitness-server.onrender.com'}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const registrationResult = await registrationResponse.json();
      console.log('📋 Registration response:', registrationResult);
      console.log('📋 Registration status code:', registrationResponse.status);

      if (registrationResult.success) {
        console.log('✅ User registered successfully:', registrationResult.data.id);
        setUserRegistered(true);
        
        // Generate meal schedule for the user
        try {
          console.log('🔄 Attempting to generate meal schedule for user:', registrationResult.data.id);
          
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

          console.log('📋 Schedule generation response status:', scheduleResponse.status);
          const scheduleResult = await scheduleResponse.json();
          console.log('📋 Schedule generation response:', scheduleResult);
          
          if (scheduleResult.success) {
            console.log('✅ Meal schedule generated for user:', registrationResult.data.id);
          } else {
            console.error('❌ Failed to generate meal schedule:', scheduleResult);
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
        console.error('❌ Failed to register user:', registrationResult);
        console.error('❌ Registration error details:', registrationResult.error);
        console.error('❌ Registration status:', registrationResponse.status);
        setError(`Payment successful but failed to create your account. Error: ${registrationResult.error || registrationResult.message || 'Unknown error'}. Please contact support.`);
      }

    } catch (dbError) {
      console.error('❌ Database error during user registration:', dbError);
      setError('Payment successful but failed to create your account. Please contact support.');
    }
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className={`${font.className}`}>
        <Header />
        <main className="min-h-screen mt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${font.className}`}>
        <Header />
        <main className="min-h-screen mt-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/user-preference')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`${font.className}`}>
      <Header />
      <main className="min-h-screen mt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Welcome to Habibi Fitness! Your meal plan is being prepared.</p>
            {userRegistered && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">✅ Account created successfully! You can now log in with your phone number.</p>
              </div>
            )}
          </div>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">
                    {formatAmount(paymentDetails.amount_total, paymentDetails.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">
                    {paymentDetails.payment_method_types?.[0]?.toUpperCase() || 'Card'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold">Paid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">
                    {new Date(paymentDetails.created * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-gray-700">Your personalized meal plan is being generated based on your preferences.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-700">You'll receive a welcome notification when your meal schedule is ready.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-700">Log in to your account to view your personalized meal schedule and delivery status.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Login to Continue
            </button>
            <button
              onClick={() => router.push('/menu')}
              className="flex-1 bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 font-semibold"
            >
              View Menu
            </button>
          </div>

          {/* Login Section */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Ready to Get Started?</h3>
            <p className="text-blue-700 mb-4">
              Your account has been created successfully! Please log in to access your personalized meal plan.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">Need help or have questions?</p>
            <p className="text-sm text-gray-500">
              Contact us at{' '}
              <a href="mailto:support@habibi-fitness.com" className="text-green-600 hover:underline">
                support@habibi-fitness.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Loading component for Suspense fallback
function PaymentSuccessLoading() {
  return (
    <div className={`${font.className}`}>
      <Header />
      <main className="min-h-screen mt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccess() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}