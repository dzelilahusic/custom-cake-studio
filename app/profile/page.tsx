"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "../components/PageShell";
import { supabase } from "../lib/supabaseClient";
import PayPalButton from "../components/PayPalButton";

const PINK = "#e7817e";
const LIGHT_PINK = "#f2b6c1";
const ADMIN_EMAIL = "husic.dzelila@gmail.com";

type Order = {
  id: string;
  status:
    | "sent_for_approval"
    | "approved"
    | "not_approved"
    | "ready_for_collecting"
    | "collected";
  needed_for_date: string;
};

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

function getStatusLabel(status: string) {
  switch (status) {
    case "sent_for_approval":
      return "Sent for approval";
    case "approved":
      return "Approved";
    case "not_approved":
      return "Not approved";
    case "ready_for_collecting":
      return "Ready for collecting";
    case "collected":
      return "Collected";
    default:
      return status.replaceAll("_", " ");
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "sent_for_approval":
      return "bg-orange-100 text-orange-700";
    case "approved":
      return "bg-green-100 text-green-700";
    case "not_approved":
      return "bg-red-100 text-red-700";
    case "ready_for_collecting":
      return "bg-yellow-100 text-yellow-800";
    case "collected":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);


  useEffect(() => {
  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // 👇 OVO JE NOVO – ADMIN NE SMIJE NA PROFILE
    if (user.email === ADMIN_EMAIL) {
      router.push("/admin");
      return;
    }

    setEmail(user.email ?? null);
    setPhone(user.user_metadata?.phone ?? null);

    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("id, status, needed_for_date, admin_note, not_approved_reason, created_at, items")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && ordersData) {
      setOrders(ordersData);
    }
  }

  loadUser();
}, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const [showPayment, setShowPayment] = useState(false);

  return (
    <PageShell>
      <div
        className="bg-white/80 backdrop-blur border-2 rounded-xl p-6"
        style={{ borderColor: PINK }}
      >
        <div className="flex items-center justify-between">
  <h1 className="text-2xl font-semibold">Profile</h1>

  <button
    onClick={logout}
    className="rounded-lg px-4 py-2 text-sm font-medium transition hover:opacity-90"
    style={{ background: PINK, color: "white" }}
  >
    Logout
  </button>
</div>

<p className="text-gray-600 mt-1">
  Your account details and order history.
</p>

        {/* PROFILE INFO */}
        <div
  className="mt-6 border rounded-xl p-4 bg-white"
  style={{ borderColor: LIGHT_PINK }}
>
          <div className="font-semibold mb-2">Account information</div>

          <div className="text-sm text-gray-700">
            Email:{" "}
            <span className="font-medium">
              {email || "—"}
            </span>
          </div>

          <div className="text-sm text-gray-700 mt-1">
            Phone:{" "}
            <span className="font-medium">
              {phone || "—"}
            </span>
          </div>
        </div>

        {/* ORDERS */}
        <div
  className="mt-4 border rounded-xl bg-gray-50 p-4"
  style={{ borderColor: LIGHT_PINK }}
>
  <div className="font-semibold mb-3">Your orders</div>

  {orders.length === 0 && (
    <div className="text-sm text-gray-500">
      You have no orders yet.
    </div>
  )}

  <div className="space-y-2">
  {orders.map((order) => {
    const orderTotal = order.items.reduce(
      (sum: number, item: CartItem) => sum + (item.price ?? 0),
      0
    );

    return (
      <div
        key={order.id}
        className="border-2 rounded-lg p-3 text-sm flex items-stretch justify-between bg-white"
        style={{ borderColor: LIGHT_PINK }}
      >
        {/* LEFT SIDE */}
        <div>
          <div>
            <span className="font-medium">Order ID:</span>{" "}
            {order.id}
          </div>

          <div className="mt-1">
            <span className="font-medium">Needed for:</span>{" "}
            {order.needed_for_date}
          </div>

          <div className="mt-3 space-y-2">
            {order.items.map((item: CartItem, idx: number) => (
              <div
                key={idx}
                className="flex gap-3 border rounded-md p-2 bg-gray-50"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}

                <div className="text-sm">
                  <div className="font-medium">{item.title}</div>

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
                    <div className="mt-1 text-gray-500 italic">
                      Note: {item.notes}
                    </div>
                  )}

                  {item.price != null && (
                    <div className="text-sm mt-1">
                      Price:{" "}
                      <span style={{ color: PINK }}>
                        {item.price} KM
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-1">
                    Source: {item.source}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(
              order.status
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>

          {order.status === "not_approved" && order.not_approved_reason && (
  <div className="ml-4 mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
    <span className="font-medium">
      Reason for not approving the order:
    </span>{" "}
    {order.not_approved_reason}
  </div>
)}

{order.status === "approved" && (
  <div className="ml-auto mt-2 w-[450px] rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
    <p className="mb-2">
      Your order has been approved. Please proceed with payment at least
      <strong> 3 days before pickup </strong>
      in order for your cake to be made.
    </p>

    <button
  onClick={() => setShowPayment(true)}
  className="text-white px-4 py-2 rounded hover:brightness-110"
  style={{ background: PINK, color: "white" }}
>
  Proceed to pay
</button>

{showPayment && (
  <PayPalButton amountKM={orderTotal} />
)}

  </div>
)}

          {order.admin_note && (
            <div className="text-xs text-gray-500 text-right max-w-[220px]">
              {order.admin_note}
            </div>
          )}

          <div className="mt-auto text-right">
  <div className="text-xl font-semibold text-black">
    Total:
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

      {/* NOTE PLACEHOLDER (kasnije) */}
      {/* <span className="text-xs text-gray-500">Admin note here</span> */}
    </div>
  </div> 
</PageShell> 
);
}
