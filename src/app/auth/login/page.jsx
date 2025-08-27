"use client";

import Link from "next/link";
import Header from "../../components/Header";

export default function Login() {
  return (
    <section className="relative text-white">
      <Header />

      {/* Login Background */}
      <div
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(/images/login-bg.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* LoginForm.jsx (snippet only — no export) */}
        {/* Glass / transparent panel */}
        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xs shadow-[0_20px_90px_-20px_rgba(0,0,0,.6)]">
          <div className="px-8 py-10 md:px-12 md:py-12 text-white">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              {/* Replace with your logo */}
              <img
                src="/images/logo-white.png"
                alt="Habibi Fitness"
                className="h-20 w-auto opacity-90"
              />
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-5 md:space-y-6"
            >
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="Enter Your Phone Number"
                className="w-full rounded-lg border border-black/10 bg-white text-black placeholder:text-gray-500 px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#18BD0F] focus:border-transparent"
              />

              {/* Login button */}
              <button
                type="submit"
                className="w-full select-none rounded-full px-6 py-3.5 font-semibold text-white shadow-lg transition-transform active:scale-[.99]"
                style={{ backgroundColor: "#18BD0F" }}
              >
                Login
              </button>
            </form>

            {/* Footer text */}
            <p className="mt-7 text-center text-sm text-white/90">
              Don’t have an account?{" "}
              <a
                href="/auth/signup"
                className="underline font-semibold hover:opacity-90"
                style={{ color: "#74EB6E" }}
              >
                Sign Up Here
              </a>
            </p>
          </div>
        </div>

        {/* soft vignette edges for depth (optional) */}
        <div className="pointer-events-none absolute inset-0 rounded-none bg-gradient-to-b from-transparent via-transparent to-black/10" />
      </div>
    </section>
  );
}
