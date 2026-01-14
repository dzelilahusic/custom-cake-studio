"use client";

import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";
import { supabase } from "../lib/supabaseClient";

const PINK = "#e7817e";
const LIGHT_PINK = "#f2b6c1";

type CartItem = {
  id: string;
  title: string;
  image?: string;
  size?: string;
  taste?: string;
  season?: string;
  occasion?: string;
  source: "catalog" | "custom";
  notes?: string;
  price?: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [neededDate, setNeededDate] = useState("");
  const totalPrice = items.reduce((sum, item) => {
  return sum + (item.price ?? 0);
}, 0);

  // učitaj korpu iz localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  // ukloni item
  function removeItem(id: string) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  // pošalji narudžbu
  async function onSendForApproval() {
    if (items.length === 0) return;

    if (!neededDate) {
      alert("Please select the date when you need your order.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowLoginWarning(true);
      return;
    }

    const { error } = await supabase.from("orders").insert({
  user_id: user.id,
  user_email: user.email,
  user_phone: user.user_metadata?.phone ?? null,
  items: items,
  needed_for_date: neededDate,
  status: "sent_for_approval",
});

if (error) {
  setShowErrorModal(true);
  return;
}

    localStorage.removeItem("cart");
    alert("Order sent for approval ✅");
    window.location.href = "/";
  }

  return (
    <PageShell>
      <div
        className="bg-white/85 backdrop-blur border-2 rounded-xl p-6"
        style={{ borderColor: PINK }}
      >
        <h1 className="text-2xl font-semibold">Your cart 🎂</h1>
        <p className="text-gray-600 mt-1">
          Review your cakes before sending the order for approval.
        </p>

        {/* CART ITEMS */}
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl p-4 flex gap-4 justify-between"
              style={{ borderColor: LIGHT_PINK }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-lg border"
                  style={{ borderColor: LIGHT_PINK }}
                />
              )}

              <div className="flex-1">
                <div className="font-semibold">{item.title}</div>

                {item.size && (
                  <div className="text-sm text-gray-600">
                    Size: {item.size}
                  </div>
                )}

                {item.taste && (
                  <div className="text-sm text-gray-600">
                    Taste: {item.taste}
                  </div>
                )}
                {item.notes && (
  <div className="mt-2 text-sm text-gray-500 italic">
    Notes: {item.notes}
  </div>
)}

{item.price != null && (
  <div className="text-sm font-medium mt-1">
    Price: <span style={{ color: PINK }}>{item.price} KM</span>
  </div>
)}
                <div className="text-xs text-gray-500 mt-1">
                  {item.source === "custom"
                    ? "Custom cake"
                    : "Catalog cake"}
                </div>

              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-sm font-medium"
                style={{ color: PINK }}
              >
                ✕
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-gray-500 text-sm">
              Your cart is empty.
            </div>
          )}
        </div>
        {/* TOTAL PRICE */}
<div className="mt-6 flex justify-end">
  <div className="text-xl font-semibold">
    Total:&nbsp;
    <span style={{ color: PINK }}>
      {totalPrice} KM
    </span>
  </div>
</div>

        {/* DATE + BUTTON ROW */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* DATE */}
  <div>
    <label className="text-sm text-gray-700">
      Date when you need the order
    </label>
    <input
      type="date"
      value={neededDate}
      min={new Date().toISOString().split("T")[0]}
      onChange={(e) => setNeededDate(e.target.value)}
      required
      className="mt-1 w-full border rounded-lg px-3 py-2
                 focus:outline-none focus:ring-2 focus:ring-[#e7817e]/40"
    />
  </div>

  {/* BUTTON */}
  <div className="flex items-end">
    <button
      onClick={onSendForApproval}
      disabled={items.length === 0}
      className="w-full h-[42px] rounded-lg text-white font-medium
                 transition-all duration-200 disabled:opacity-50 hover:opacity-90"
      style={{ background: PINK }}
    >
      Send order for approval
    </button>
  </div>
  </div>
  </div>

      {/* LOGIN WARNING MODAL */}
      {showLoginWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm border-2 text-center"
            style={{ borderColor: PINK }}
          >
            <h2 className="text-lg font-semibold mb-2" style={{ color: PINK }}>
              Login required
            </h2>

            <p className="text-gray-600 text-sm mb-4">
              Please log in to send your order for approval.
            </p>

            <button
              onClick={() => setShowLoginWarning(false)}
              className="w-full rounded-lg px-4 py-2 text-white"
              style={{ background: PINK }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm border-2 text-center"
            style={{ borderColor: PINK }}
          >
            <h2 className="text-lg font-semibold mb-2" style={{ color: PINK }}>
              Something went wrong
            </h2>

            <p className="text-gray-600 text-sm mb-4">
              You need to be logged in to send your order for approval.
            </p>

            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full rounded-lg px-4 py-2 text-white"
              style={{ background: PINK }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
