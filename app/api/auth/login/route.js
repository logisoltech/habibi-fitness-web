import { z } from "zod";
import { NextResponse } from "next/server";

import { supabase } from "../../../lib/supabase";

const schema = z.object({
  phone_number: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);

    // Send OTP to the phone number
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: parsed.phone_number,
    });

    if (error) throw error;

    return NextResponse.json({
      message: "OTP sent successfully",
      user: data.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    if (error.message?.includes("not found") || error.message?.includes("Invalid login credentials")) {
      return NextResponse.json(
        { error: "Phone number not registered. Please sign up first." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}