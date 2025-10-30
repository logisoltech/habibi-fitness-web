"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { font } from "../../components/font/font";
import { useUserData } from "../../contexts/UserDataContext";
import { useAuth } from "../../contexts/AuthContext";
import ApiService from "../../services/api";
import { useEffect, useMemo, useState } from "react";

const PRICES_AED = {
  weekly: 549.99,
  monthly: 1899.99,
  quarterly: 5699.99,
};

export default function ChangeSubscriptionPage() {
  const { userData, loadUserData } = useUserData();
  const { user } = useAuth();
  const [selected, setSelected] = useState(userData?.subscription || "weekly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Resolve user id/phone (context → auth → localStorage)
  const identity = useMemo(() => {
    let userId = userData?.userId || user?.id;
    let phone = userData?.phone || user?.phone;
    if (!userId && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("habibi_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          userId = parsed?.id || userId;
          phone = parsed?.phone || phone;
        }
      } catch {}
    }
    return { userId, phone };
  }, [userData?.userId, userData?.phone, user?.id, user?.phone]);

  useEffect(() => {
    // Try to hydrate context with latest user if missing
    const hydrate = async () => {
      if (userData?.subscription || !(identity.userId || identity.phone)) return;
      try {
        const res = identity.userId
          ? await ApiService.getUserById(identity.userId)
          : await ApiService.getUserByPhone(identity.phone);
        if (res?.data) loadUserData(res.data);
      } catch {}
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity.userId, identity.phone]);

  const amount = PRICES_AED[selected] || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const userId = identity.userId;
      if (!userId) throw new Error("User not identified. Please log in again.");

      // Update subscription in our database first (so UI reflects immediately)
      await ApiService.updateUser(userId, { subscription: selected });

      // Initiate Stripe checkout for the new billing cycle
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // pass dynamic pricing (AED)
          amount: Math.round(amount * 100),
          currency: "aed",
          description: `Subscription change to ${selected}`,
          metadata: {
            userId: String(userId),
            subscription: selected,
            changeType: "subscription_change",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || "Stripe error");

      if (data?.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
        return;
      }

      setMessage("Subscription updated. Stripe session created.");
    } catch (err) {
      setError(err.message || "Failed to change subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={`${font.className} max-w-3xl mx-auto px-6 py-10 mt-[100px]`}>
        <h1 className="text-3xl font-bold mt-12 text-gray-900 mb-2">Change Subscription</h1>
        <p className="text-gray-600 mb-8">Switch your billing cycle. Changes take effect on your next charge.</p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="space-y-4">
            {(["weekly", "monthly", "quarterly"]).map((cycle) => (
              <label key={cycle} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="cycle"
                  value={cycle}
                  checked={selected === cycle}
                  onChange={() => setSelected(cycle)}
                  className="accent-green-500"
                />
                <span className="text-gray-900 font-medium capitalize">{cycle}</span>
                <span className="text-sm text-gray-500 ml-2">
                  AED {PRICES_AED[cycle].toFixed(2)} per {cycle === 'quarterly' ? '3 months' : cycle}
                </span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-60"
            >
              {loading ? "Processing..." : `Update & Pay AED ${amount.toFixed(2)}`}
            </button>
            <a href="/billing/subscription" className="text-sm text-gray-600 hover:underline">Back to subscription</a>
          </div>

          {message && (
            <p className="text-sm text-green-600 mt-4">{message}</p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-4">{error}</p>
          )}
        </form>
      </div>
      <Footer />
    </>
  );
}


