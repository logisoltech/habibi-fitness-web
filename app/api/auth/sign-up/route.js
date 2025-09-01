import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "../../../lib/supabase";
import crypto from "crypto";

const schema = z.object({
  full_name: z.string(),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    // Generate a secure random password for phone auth
    const temporaryPassword = crypto.randomUUID();

    let { data, error } = await supabase.auth.signUp({
      phone: parsed.phone_number,
      password: temporaryPassword,
      options: {
        data: {
          full_name: parsed.full_name,
        }
      }
    });
    
    if (error) throw error;

    return NextResponse.json({
      message: "OTP sent successfully",
      user: data.user,
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    
    // Handle specific Supabase errors
    if (err.message?.includes("already registered")) {
      return NextResponse.json(
        { error: "Phone number already registered" }, 
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: err.message || "Sign-up failed" }, 
      { status: 400 }
    );
  }
}
