"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "../components/PageShell";
import { supabase } from "../lib/supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!email || !password || !phone) {
  alert("Please fill in all fields");
  return;
}
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
       data: {
       phone: phone,
       },
     },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Registration successful ✅ You can now log in.");
    router.push("/login");
  }

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div
          className="bg-white/80 backdrop-blur border-2 rounded-xl p-8 w-full max-w-md"
          style={{ borderColor: "#e7817e" }}
        >
          <h1 className="text-2xl font-semibold text-center">Register</h1>
          <p className="text-gray-600 text-sm text-center mt-1">
            Create an account to order cakes and use AI features
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
  <label className="text-sm text-gray-700">Phone number</label>
  <input
    type="tel"
    className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e7817e]/40"
    placeholder="+387 61 123 456"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
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

            <div>
              <label className="text-sm text-gray-700">Confirm password</label>
              <input
                type="password"
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e7817e]/40"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-[#e7817e] text-white rounded-lg px-4 py-2 hover:opacity-90 transition"
            >
              Register
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-[#e7817e] hover:underline">
              Login
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
