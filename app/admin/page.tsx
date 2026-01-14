"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "../components/PageShell";
import { supabase } from "../lib/supabaseClient";

const ADMIN_EMAIL = "husic.dzelila@gmail.com";
const PINK = "#e7817e";
const LIGHT_PINK = "#f2b6c1";
const NOT_APPROVED_REASONS = [
  "Date fully booked",
  "Design not feasible",
  "Other",
];

type CartItem = {
  id: string;
  title: string;
  image?: string;
  size?: string;
  taste?: string;
  notes?: string;
  source: string;
  price?: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, status, needed_for_date, admin_note, items, user_email, user_phone"
        )
        .order("created_at", { ascending: false });

      console.log("ADMIN ORDERS:", data, error);

      if (!error && data) {
        setOrders(data);
      }

      setLoading(false);
    }

    loadOrders();
  }, [router]);

  async function saveOrder(order: any) {
    setSavingId(order.id);

    await supabase
  .from("orders")
  .update({
    status: order.status,
    admin_note: order.admin_note,
    not_approved_reason: order.not_approved_reason ?? null,
  })
  .eq("id", order.id);

    setSavingId(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <PageShell>
        <div className="p-6">Loading orders...</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div
        className="bg-white/80 backdrop-blur border-2 rounded-xl p-6"
        style={{ borderColor: PINK }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            Admin – Orders
          </h1>

          <button
            onClick={logout}
            className="rounded-lg px-4 py-2 text-sm font-medium transition hover:opacity-90"
            style={{ background: PINK, color: "white" }}
          >
            Logout
          </button>
        </div>

        {orders.length === 0 && (
          <div className="text-sm text-gray-500">
            No orders yet.
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => {
            const orderTotal = order.items.reduce(
              (sum: number, item: CartItem) =>
                sum + (item.price ?? 0),
              0
            );

            return (
              <div
                key={order.id}
                className="border-2 rounded-lg p-4 flex justify-between gap-6"
                style={{ borderColor: LIGHT_PINK }}
              >
                {/* LEFT SIDE */}
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">
                      Order ID:
                    </span>{" "}
                    {order.id}
                  </div>

                  <div className="text-sm mt-1">
                    <span className="font-medium">
                      Needed for:
                    </span>{" "}
                    {order.needed_for_date}
                  </div>

                  <div className="text-sm mt-1">
                    <span className="font-medium">
                      Email:
                    </span>{" "}
                    {order.user_email || "—"}
                  </div>

                  <div className="text-sm mt-1">
                    <span className="font-medium">
                      Phone:
                    </span>{" "}
                    {order.user_phone || "—"}
                  </div>

                  {/* ITEMS */}
                  <div className="mt-4 space-y-2">
                    {order.items.map(
                      (item: CartItem, idx: number) => (
                        <div
                          key={idx}
                          className="flex gap-3 border rounded-md p-2 bg-gray-50"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              className="w-20 h-20 object-cover rounded"
                              alt={item.title}
                            />
                          )}

                          <div className="text-sm">
                            <div className="font-medium">
                              {item.title}
                            </div>

                            {item.size && (
                              <div className="text-gray-600">
                                Size: {item.size}
                              </div>
                            )}

                            {item.taste && (
                              <div className="text-gray-600">
                                Taste: {item.taste}
                              </div>
                            )}

                            {item.notes && (
                              <div className="italic text-gray-500">
                                Note: {item.notes}
                              </div>
                            )}

                            {item.price != null && (
                              <div>
                                Price:{" "}
                                <span
                                  style={{ color: PINK }}
                                >
                                  {item.price} KM
                                </span>
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              Source: {item.source}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="w-[260px] flex flex-col gap-2">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      setOrders((prev) =>
                        prev.map((o) =>
                          o.id === order.id
                            ? {
                                ...o,
                                status: e.target.value,
                              }
                            : o
                        )
                      )
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="sent_for_approval">
                      Sent for approval
                    </option>
                    <option value="approved">
                      Approved
                    </option>
                    <option value="not_approved">
                      Not approved
                    </option>
                    <option value="ready_for_collecting">
                      Ready for collecting
                    </option>
                    <option value="collected">
                      Collected
                    </option>
                  </select>

                  {order.status === "not_approved" && (
  <select
    className="border rounded px-2 py-1 text-sm"
    value={order.not_approved_reason || ""}
    onChange={(e) =>
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, not_approved_reason: e.target.value }
            : o
        )
      )
    }
  >
    <option value="">Select reason</option>
    {NOT_APPROVED_REASONS.map((r) => (
      <option key={r} value={r}>
        {r}
      </option>
    ))}
  </select>
)}

                  <textarea
                    placeholder="Admin note (optional)"
                    className="border rounded px-2 py-1 text-sm resize-none"
                    rows={2}
                    value={order.admin_note || ""}
                    onChange={(e) =>
                      setOrders((prev) =>
                        prev.map((o) =>
                          o.id === order.id
                            ? {
                                ...o,
                                admin_note: e.target.value,
                              }
                            : o
                        )
                      )
                    }
                  />

                  <button
                    onClick={() => saveOrder(order)}
                    disabled={savingId === order.id}
                    className="px-3 py-1 rounded text-sm text-white hover:opacity-90 disabled:opacity-60"
                    style={{ background: PINK }}
                  >
                    {savingId === order.id
                      ? "Saving..."
                      : "Save"}
                  </button>

                  <div className="mt-auto text-right">
                    <div className="text-base font-semibold text-black">
                      Total
                    </div>
                    <div
                      className="text-xl font-bold"
                      style={{ color: PINK }}
                    >
                      {orderTotal} KM
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
