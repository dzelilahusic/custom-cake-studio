"use client";

import { useState } from "react";
import PageShell from "../components/PageShell";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // LOGIN (kako si i imala)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // UZMI USER IZ SESSIONA (NE IZ signIn RESPONSE)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email?.includes("dzelila")) {
  router.push("/admin");
} else {
  router.push("/");
}

  }

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div
          className="bg-white/80 backdrop-blur border-2 rounded-xl p-8 w-full max-w-md"
          style={{ borderColor: "#e7817e" }}
        >
          <h1 className="text-2xl font-semibold text-center">Login</h1>
          <p className="text-gray-600 text-sm text-center mt-1">
            Log in to order cakes and view your profile
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e7817e]/40"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Password</label>
              <input
                type="password"
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e7817e]/40"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-[#e7817e] text-white rounded-lg px-4 py-2 hover:opacity-90 transition"
            >
              Login
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-[#e7817e] hover:underline">
              Register
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
