// components/Header.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// import { useAuth } from "../contexts/AuthContext"; // Previous Supabase auth
import Sidebar from "./Sidebar";

const MAIN = "#18BD0F"; // main color

export default function Header() {
  const [showBanner, setShowBanner] = useState(true);
  const [open, setOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  // const { user, isAuthenticated, logout } = useAuth(); // Previous Supabase auth

  // New localStorage-based auth logic
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  // Check authentication status on component mount
  React.useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user_data");
        const guestMode = localStorage.getItem("guest_mode");
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuth(true);
          setIsGuestMode(false);
        } else if (guestMode === 'true') {
          setUser({ id: 'guest', name: 'Guest User', isGuest: true });
          setIsAuth(false);
          setIsGuestMode(true);
        } else {
          setUser(null);
          setIsAuth(false);
          setIsGuestMode(false);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
        setIsAuth(false);
        setIsGuestMode(false);
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "user_data" || e.key === "guest_mode") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check on focus (when user returns to tab)
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  const isAuthenticated = () => isAuth;

  const logout = () => {
    localStorage.removeItem("user_data");
    localStorage.removeItem("guest_mode");
    setUser(null);
    setIsAuth(false);
    setIsGuestMode(false);
    window.location.href = "/";
  };

  const handleGuestAccess = () => {
    localStorage.setItem("guest_mode", "true");
    setIsGuestMode(true);
    window.location.href = "/dashboard";
  };

  const nav = [
    { href: "/dashboard", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const handleHomeClick = (e) => {
    // If in guest mode, allow access to dashboard
    if (isGuestMode) {
      // Let the normal link behavior proceed to /dashboard
      return;
    }
    
    // If not authenticated and not in guest mode, redirect to login
    if (!isAuthenticated()) {
      e.preventDefault();
      window.location.href = "/auth/login";
    }
    // If authenticated, let the normal link behavior proceed to /dashboard
  };

  return (
    <div className="relative z-50">
      {/* Sidebar */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-black/70 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed top-0 right-0 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} onLogout={logout} />
        </div>
      </div>
      {/* Top Offer Banner */}
      {showBanner && (
        <div
          className="fixed top-0 left-0 w-full text-sm gap-3 px-10 py-3 max-sm:px-4 text-white max-sm:text-xs max-sm:text-center z-50"
          style={{ backgroundColor: MAIN }}
        >
          <span className="font-semibold">Limited Time Offer! </span>
          <span className="hidden max-sm:block">
            <br />
          </span>
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
      <header className={`fixed z-40 left-8 right-8 shadow-lg rounded-full border-t-2 border-gray-200 transition-all duration-300 ${showBanner ? 'top-[76px]' : 'top-4'}`}>
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
                  onClick={item.href === "/dashboard" ? handleHomeClick : undefined}
                  className={[
                    "px-3 py-2 rounded-full transition",
                    isActive(item.href)
                      ? "text-[#18BD0F]"
                      : "hover:text-[#18BD0F]/80",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: Login/Signup or User Menu (desktop) */}
          <div className="hidden md:flex items-center">
            {isAuthenticated() ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">
                  Welcome, {user?.name || "User"}!
                </span>
                 <button 
                   onClick={() => setSidebarOpen(true)}
                   className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                 >
                   <svg
                     className="w-6 h-6 text-white"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M4 6h16M4 12h16M4 18h16"
                     />
                   </svg>
                 </button>
              </div>
            ) : isGuestMode ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('guest_mode');
                    setIsGuestMode(false);
                    window.location.href = '/';
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                >
                  Logout
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('guest_mode');
                    window.location.href = '/auth/login';
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium text-white shadow-sm transition"
                  style={{ backgroundColor: MAIN }}
                >
                  Login for Full Access
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGuestAccess}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                >
                  Access As Guest
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
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
            )}
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
        className={`md:hidden fixed inset-0 z-40 transition ${
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
                  onClick={(e) => {
                    if (item.href === "/dashboard") {
                      handleHomeClick(e);
                    }
                    setOpen(false);
                  }}
                  className={[
                    "block px-4 py-3 rounded-lg text-white",
                    isActive(item.href)
                      ? "text-[#18BD0F]"
                      : "hover:text-[#18BD0F]/80",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              {isAuthenticated() ? (
                <div className="space-y-2">
                  <div className="text-center text-gray-700 font-medium py-2">
                    Welcome, {user?.name || "User"}!
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="block w-full text-center rounded-lg px-4 py-3 font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              ) : isGuestMode ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('guest_mode');
                      setIsGuestMode(false);
                      setOpen(false);
                      window.location.href = '/';
                    }}
                    className="block w-full text-center rounded-lg px-4 py-3 font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('guest_mode');
                      setOpen(false);
                      window.location.href = '/auth/login';
                    }}
                    className="block w-full text-center rounded-lg px-4 py-3 font-medium text-white"
                    style={{ backgroundColor: MAIN }}
                  >
                    Login for Full Access
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleGuestAccess();
                      setOpen(false);
                    }}
                    className="block w-full text-center rounded-lg px-4 py-3 font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                  >
                    Access As Guest
                  </button>
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="block text-center rounded-lg px-4 py-3 font-medium text-white"
                    style={{ backgroundColor: MAIN }}
                  >
                    Login/Signup
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
