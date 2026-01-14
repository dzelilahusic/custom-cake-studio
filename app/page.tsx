import Link from "next/link";

export default function HomePage() {
  return (
    <div
      className="min-h-[calc(100vh-72px)] flex flex-col justify-between"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/bgd.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* HERO CONTENT */}
      <div className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-2xl mt-10">
            <h1 className="text-5xl font-semibold text-white leading-tight">
              Cakes, designed your way.
            </h1>

            <p className="text-white/90 mt-4 text-lg">
              Choose from our catalog or design a custom cake with the help of AI.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {/* CATALOG BUTTON */}
              <Link
                href="/catalog"
                className="
                  bg-white text-black rounded px-6 py-3
                  text-sm font-medium text-center
                  transition-all duration-200
                  hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                  active:scale-[0.97]
                "
              >
                Order cake from catalog
              </Link>

              {/* AI BUTTON */}
              <Link
                href="/ai"
                className="
                  bg-[#f2b6c1] text-black rounded px-6 py-3
                  text-sm font-medium text-center
                  transition-all duration-200
                  hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                  active:scale-[0.97]
                "
              >
                Order custom cake with AI
              </Link>
            </div>

            <p className="text-white/70 text-xs mt-5">
              You must be logged in to place an order.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM INFO SECTION */}
      <div className="relative text-white">
  {/* BACKGROUND STRIP */}
  <div
    className="absolute inset-x-0 bottom-0 h-43 bg-[#8e5c5c]"
    style={{ opacity: 0.2 }}
  />
          {/* VALUES */}
          <div className="relative max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-medium mb-2">Why choose us?</div>
            <ul className="text-sm space-y-2 text-white/90">
              <li>🎂 Custom designs for every occasion</li>
              <li>🕒 Easy ordering & fast approval</li>
              <li>💳 Secure online payment</li>
            </ul>
          </div>

          {/* ABOUT */}
          <div>
            <div className="font-medium mb-2">About us</div>
            <p className="text-sm text-white/90">
              We specialize in made-to-order cakes designed to match your ideas,
              preferences, and special moments. Each cake is carefully prepared
              with attention to detail and quality.
            </p>
          </div>

          {/* CONTACT */}
          <div className="md:pl-14">
            <div className="font-medium mb-2">Contact</div>
            <p className="text-sm text-white/90">
              Email: info@cakeaishop.com <br />
              Phone: +387 62 312 867 <br />
              Location: Sarajevo, Bosnia and Herzegovina
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
