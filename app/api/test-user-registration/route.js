import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const testUserData = {
      name: "Test User",
      phone: "1234567890",
      address: "Test Address",
      plan: "Balanced",
      goal: "Staying Fit",
      weight: "70",
      height: "170",
      age: "25",
      gender: "Male",
      mealtypes: ["lunch", "dinner"], // Send as array
      selecteddays: ["MON", "TUE", "WED", "THU", "FRI"], // Send as array
      subscription: "monthly",
      bmi: "24.2",
      tdee: "2000",
      allergies: [] // Send as array
    };

    console.log('🧪 Testing user registration with data:', testUserData);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://habibi-fitness-server.onrender.com'}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData),
    });

    const result = await response.json();
    
    console.log('🧪 Test registration response:', result);
    console.log('🧪 Test registration status:', response.status);

    return NextResponse.json({
      success: true,
      testResult: result,
      status: response.status,
      message: 'Test completed'
    });

  } catch (error) {
    console.error('❌ Test registration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}
