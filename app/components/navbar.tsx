"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ADMIN_EMAIL = "husic.dzelila@gmail.com"; // <-- TAČAN ADMIN EMAIL

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  const navLink =
    "text-white/90 text-[17px] hover:text-white transition-all border-b-2 border-transparent hover:border-white pb-[2px]";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // ⛔ ADMIN NE VIDI NAVBAR
  if (isAdmin) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: "#e7817e" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* LOGO + NAME */}
        <Link href="/" className="flex items-center gap-2">
          <img
  src="/logo.png"
  alt="Cake logo"
  className="w-8 h-8"
/>
          <span className="relative text-white font-semibold text-[18px]">
  Custom Cake Studio
  <span className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-black"></span>
</span>
        </Link>

        {/* NAV */}
        <div className="flex items-center gap-7">
          {!user && (
            <Link
              href="/login"
              className="
                bg-white text-[#e7817e]
                rounded-full px-5 py-2
                text-[15px] font-medium
                hover:bg-white/90 transition
              "
            >
              Login
            </Link>
          )}

          {user && (
            <>
              <Link href="/catalog" className={navLink}>
                Catalog
              </Link>

              <Link href="/ai" className={navLink}>
                Custom order
              </Link>

              <Link href="/cart" className={navLink}>
                Cart
              </Link>

              <Link href="/profile" className={navLink}>
                Profile
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
