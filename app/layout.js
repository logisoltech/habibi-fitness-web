import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LeafCursorTrail from "./components/LeafCursorTrail";
import { AuthProvider } from "./contexts/AuthContext";
import { UserDataProvider } from "./contexts/UserDataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Habibi Fitness",
  description: "Your fitness journey starts here",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserDataProvider>
          <AuthProvider>{children}</AuthProvider>
        </UserDataProvider>
        <LeafCursorTrail />
      </body>
    </html>
  );
}
