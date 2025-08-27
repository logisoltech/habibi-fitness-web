"use client";

import { useRouter } from "next/navigation";
import { font } from "./font/font";
import Link from "next/link";

export default function Footer() {
  const navigate = useRouter();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const footerLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  const bottomLinks = [
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "Legal", href: "/legal" },
  ];

  return (
    <footer
      className={`${font.className} px-10 pt-12 border-t border-black/20`}
    >
      {/* Main Footer Content */}
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-black/20 pb-8">
        {/* Left Side - Logo and Description */}
        <div className="md:max-w-96">
          <div className="flex items-center gap-2 mb-6">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavigate("/")}
            >
              <img
                src="/images/logo-green.png"
                alt="Logo"
                className="h-12 w-auto"
              />
            </div>
          </div>
          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap max-sm:flex-col items-center max-sm:items-start gap-6 text-sm text-black/80">
              {footerLinks.map((link) => (
                <Link
                  href={link.href}
                  className="transition-colors"
                  key={link.label}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Navigation and Newsletter */}
        <div className="flex-1 flex flex-col md:flex-row items-start md:justify-end gap-16">
          {/* Newsletter Subscription */}
          <div className="w-full max-w-sm">
            <h3 className="text-black mb-3">Get the freshest news!</h3>
            <div className="text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <input
                  className="flex-1 border border-black/30 bg-white/10 placeholder-black/60 text-black focus:ring-2 ring-black/30 focus:border-black/50 outline-none py-3 rounded-lg px-3 backdrop-blur-sm w-full"
                  type="email"
                  placeholder="Enter your email"
                />
                <button className="bg-[#18BD0F] hover:bg-[#18BD0F]/90 px-6 h-10 text-white rounded-lg font-medium transition-colors w-full sm:w-auto">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pt-6">
        {/* Footer Links */}
        <div className="flex max-sm:flex-col max-sm:items-start flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap max-sm:flex-col sm:items-center gap-6 text-sm text-black/80">
            {bottomLinks.map((link) => (
              <Link
                href={link.href}
                className="text-gray-500 hover:text-black/90 transition-colors"
                key={link.label}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm max-sm:mx-auto text-black/80">
            © 2025. All right reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
