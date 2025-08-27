// components/Header.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const MAIN = "#18BD0F"; // main color

export default function Header() {
  const [showBanner, setShowBanner] = useState(true);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <div className="relative">
      {/* Top Offer Banner */}
      {showBanner && (
        <div
          className="w-full text-sm gap-3 px-10 py-3 max-sm:px-4 text-white max-sm:text-xs max-sm:text-center"
          style={{ backgroundColor: MAIN }}
        >
          <span className="font-semibold">Limited Time Offer! </span>
          <span className="hidden max-sm:block"><br /></span>
          <span className="opacity-90">
            Use code <b>SAVE10</b> for 10% off
          </span>
          <button
            aria-label="Close"
            className="ml-3 rounded-full border border-white/30 px-2 leading-none hover:bg-black/15"
            onClick={() => setShowBanner(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Navbar */}
      <header className="absolute z-50 top-15 left-8 right-8 shadow-lg rounded-full border-t-2 border-gray-200">
        <nav className="flex mx-auto items-center justify-between bg-white rounded-full px-6 py-2 text-black">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* replace with your logo path */}
            <Image
              src="/images/logo-green.png"
              alt="Habibi Fitness"
              width={120}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Center: Links (desktop) */}
          <ul className="hidden md:flex items-center gap-6">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "px-3 py-2 rounded-full transition",
                    isActive(item.href)
                      ? "bg-white/10 border border-white/15"
                      : "hover:bg-white/10",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: Login/Signup (desktop) */}
          <div className="hidden md:flex items-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 font-medium text-white shadow-sm transition"
              style={{ backgroundColor: MAIN }}
            >
              Login/Signup
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md border border-white/20 p-2"
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 z-50 transition ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[78%] max-w-xs bg-zinc-900/95 backdrop-blur-md shadow-xl transition-transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <Image
              src="/images/logo-green.png"
              alt="Habibi Fitness"
              width={110}
              height={34}
              className="h-8 w-auto"
            />
            <button
              className="rounded-md p-2 border border-white/20"
              onClick={() => setOpen(false)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="white"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="px-3 py-3 space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "block px-4 py-3 rounded-lg text-white",
                    isActive(item.href)
                      ? "bg-white/10 border border-white/10"
                      : "hover:bg-white/10",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block text-center rounded-lg px-4 py-3 font-medium text-white"
                style={{ backgroundColor: MAIN }}
              >
                Login/Signup
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
