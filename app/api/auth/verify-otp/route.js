import { z } from "zod";
import { NextResponse } from "next/server";

import { supabase } from "../../../lib/supabase";

const schema = z.object({
  phone_number: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: parsed.phone_number,
      token: parsed.otp,
      type: "sms",
    });

    if (error) throw error;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        phone_number: parsed.phone_number,
        full_name: data.user.user_metadata.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    return NextResponse.json({
      message: "OTP verified successfully",
      user: data.user,
      session: data.session,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    if (
      error.message?.includes("invalid") ||
      error.message?.includes("expired")
    ) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "OTP verification failed" },
      { status: 400 }
    );
  }
}
