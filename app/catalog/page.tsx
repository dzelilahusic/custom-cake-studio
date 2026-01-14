"use client";

import { useState } from "react";
import PageShell from "../components/PageShell";

type Size = "Small" | "Medium" | "Large";

type Cake = {
  id: string;
  name: string;
  image: string;
  prices: { Small: number; Medium: number; Large: number };
};

const PINK = "#e7817e";
const LIGHT_PINK = "#f2b6c1";

const CAKES: Cake[] = [
  {
    id: "vanilla",
    name: "Vanilla",
    image: "/van.png",
    prices: { Small: 35, Medium: 45, Large: 60 },
  },
  {
    id: "chocolate",
    name: "Chocolate",
    image: "/cok.png",
    prices: { Small: 38, Medium: 48, Large: 65 },
  },
  {
    id: "strawberry",
    name: "Strawberry",
    image: "/jag.png",
    prices: { Small: 37, Medium: 47, Large: 63 },
  },
  {
    id: "vanilla-raspberry",
    name: "Vanilla – Raspberry",
    image: "/vanmal.png",
    prices: { Small: 40, Medium: 52, Large: 70 },
  },
  {
    id: "oreo",
    name: "Oreo",
    image: "/oreo.png",
    prices: { Small: 42, Medium: 55, Large: 75 },
  },
  {
    id: "coconut",
    name: "Coconut",
    image: "/kok.png",
    prices: { Small: 41, Medium: 54, Large: 74 },
  },
  {
    id: "choco-pistachio",
    name: "Choco – Pistachio",
    image: "/cokpis.png",
    prices: { Small: 45, Medium: 58, Large: 80 },
  },
  {
    id: "lemon",
    name: "Lemon",
    image: "/lim.png",
    prices: { Small: 36, Medium: 46, Large: 62 },
  },
  {
    id: "choco-hazelnut",
    name: "Choco – Hazelnut",
    image: "/cokljes.png",
    prices: { Small: 44, Medium: 57, Large: 78 },
  },
];

export default function CatalogPage() {
  const [selectedSizeByCake, setSelectedSizeByCake] = useState<Record<string, Size>>(
    () => {
      const init: Record<string, Size> = {};
      for (const c of CAKES) init[c.id] = "Medium";
      return init;
    }
  );

  function setSize(cakeId: string, size: Size) {
    setSelectedSizeByCake((prev) => ({ ...prev, [cakeId]: size }));
  }

  function addToCart(cake: Cake) {
  const size = selectedSizeByCake[cake.id] || "Medium";

  const newItem = {
    id: `${cake.id}-${size}-${Date.now()}`,
    title: cake.name,
    image: cake.image,
    size,
    price: cake.prices[size],
    source: "catalog" as const,
  };

  const stored = localStorage.getItem("cart");
  const cart = stored ? JSON.parse(stored) : [];

  const updatedCart = [...cart, newItem];
  localStorage.setItem("cart", JSON.stringify(updatedCart));

  // opcionalno – mali feedback
  alert("Added to cart 🛒");
}

  return (
    <PageShell>
      {/* Main container */}
      <div
        className="bg-white/80 backdrop-blur border-2 rounded-xl p-6"
        style={{ borderColor: PINK }}
      >
        <h1 className="text-2xl font-semibold">Catalog</h1>
        <p className="text-gray-600 mt-1">
          Choose your cake flavor and size.
        </p>

        {/* Grid 3x3 */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAKES.map((cake) => {
            const chosen = selectedSizeByCake[cake.id];

            return (
              <div
                key={cake.id}
                className="group bg-white border rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderColor: "rgba(0,0,0,0.1)" }}
              >
                {/* Cake image */}
                <img
                  src={cake.image}
                  alt={cake.name}
                  className="h-40 w-full object-cover rounded-lg border transition-all duration-200"
                  style={{ borderColor: LIGHT_PINK }}
                />

                <div className="mt-3 font-semibold text-lg">{cake.name}</div>

                {/* Size selector */}
                <div className="mt-3">
                  <label className="text-sm text-gray-700">Choose size</label>
                  <select
                    className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ outlineColor: PINK }}
                    value={chosen}
                    onChange={(e) => setSize(cake.id, e.target.value as Size)}
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>

                {/* Prices */}
                <div className="mt-3 text-sm text-gray-700 border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between">
                    <span>Small</span>
                    <span className="font-medium">{cake.prices.Small} KM</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Medium</span>
                    <span className="font-medium">{cake.prices.Medium} KM</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Large</span>
                    <span className="font-medium">{cake.prices.Large} KM</span>
                  </div>
                </div>

                {/* Add to cart */}
                <button
                  className="mt-4 w-full border rounded-lg px-4 py-2 transition-all duration-200 font-medium"
                  style={{ color: PINK, borderColor: LIGHT_PINK }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = PINK;
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = PINK;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = PINK;
                    e.currentTarget.style.borderColor = LIGHT_PINK;
                  }}
                  onClick={() => addToCart(cake)}
                >
                  Add to cart
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* hover refinements */}
      <style jsx global>{`
        .group:hover {
          border-color: ${PINK} !important;
        }
        .group:hover img {
          border-color: ${PINK} !important;
        }
      `}</style>
    </PageShell>
  );
}
