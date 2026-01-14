"use client";

import { useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { supabase } from "../lib/supabaseClient";

type Suggestion = { title: string };

const PINK = "#e7817e";
const LIGHT_PINK = "#f2b6c1";

const CUSTOM_PRICES: Record<string, number> = {
  "8–12 people (one tier)": 60,
  "14–18 people (one tier)": 80,
  "24–30 people (two tier)": 100,
};

export default function AiPage() {
  // DESIGN
  const [query, setQuery] = useState("");
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [designError, setDesignError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [selectedDesignIdx, setSelectedDesignIdx] = useState<number | null>(null);

  // UPLOAD (SINGLE IMAGE)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // ORDER OPTIONS
  const sizeOptions = ["8–12 people (one tier)", "14–18 people (one tier)", "24–30 people (two tier)"];
  const tasteOptions = useMemo(
    () => [
      "Vanilla",
      "Chocolate",
      "Strawberry",
      "Vanilla - Raspberry",
      "Oreo",
      "Coconut",
      "Choco - Pistachio",
      "Lemon",
      "Choco - Hazelnut",
    ],
    []
  );

  const [size, setSize] = useState(sizeOptions[1]);
  const price = size ? CUSTOM_PRICES[size] : null;
  const [taste, setTaste] = useState(tasteOptions[0]);
  const [tastePickedFromAI, setTastePickedFromAI] = useState(false);

  // PREDICTIVE AI
  const [season, setSeason] = useState("Winter");
  const [occasion, setOccasion] = useState("Birthday");
  const [ageGroup, setAgeGroup] = useState("Children");

  const [loadingPredict, setLoadingPredict] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [predictedFlavors, setPredictedFlavors] = useState<string[]>([]);

  // NOTES
  const [notes, setNotes] = useState("");

  const selectedDesignTitle =
    selectedDesignIdx !== null
      ? suggestions[selectedDesignIdx]?.title
      : "Not selected";

  async function onGenerateDesigns() {
    setLoadingDesign(true);
    setDesignError(null);
    setSuggestions([]);
    setImages([]);
    setSelectedDesignIdx(null);

    try {
      const res = await fetch("/api/ai-cakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      console.log("AI response:", data);
      if (!res.ok) {
        setDesignError(data?.error || "Error generating designs.");
        return;
      }

      setSuggestions(
        (data.suggestions || []).map((s: any) => ({ title: s.title }))
      );
      setImages(
        (data.images || []).map(
          (b64: string) => `data:image/png;base64,${b64}`
        )
      );
    } catch (e: any) {
      setDesignError(e?.message || "Error generating designs.");
    } finally {
      setLoadingDesign(false);
    }
  }

  async function uploadDesignImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("cake-designs")
      .upload(fileName, file);

    if (error) {
      alert("Image upload failed");
      return null;
    }

    const { data } = supabase.storage
      .from("cake-designs")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function onPredictFlavors() {
    setLoadingPredict(true);
    setPredictError(null);
    setPredictedFlavors([]);

    try {
      const res = await fetch("/api/predict-flavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season, occasion, ageGroup }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPredictError(data?.error || "Error predicting flavors.");
        return;
      }

      setPredictedFlavors((data.flavors || []).slice(0, 3));
    } catch (e: any) {
      setPredictError(e?.message || "Error predicting flavors.");
    } finally {
      setLoadingPredict(false);
    }
  }

  function selectFlavorFromAI(flavor: string) {
    setTaste(flavor);
    setTastePickedFromAI(true);
  }

  function onAddToCart() {
    if (selectedDesignIdx === null && !uploadedImageUrl) {
      alert("Please select an AI design or upload your own image.");
      return;
    }

    const cartItem = {
      id: crypto.randomUUID(),
      title:
        selectedDesignIdx !== null
          ? suggestions[selectedDesignIdx]?.title || "Custom cake"
          : "Uploaded custom cake",
      image:
        selectedDesignIdx !== null
          ? images[selectedDesignIdx]
          : uploadedImageUrl,
      size,
      taste,
      season,
      occasion,
      source: "custom",
      notes: notes,
      price: price,
    };

    const existing = localStorage.getItem("cart");
    const cart = existing ? JSON.parse(existing) : [];

    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Added to cart 🛒");
  }

  return (
    <PageShell>
      <div
        className="bg-white/85 backdrop-blur rounded-xl border-2 p-6"
        style={{ borderColor: PINK }}
      >
        <h1 className="text-2xl font-semibold">AI Cake Finder</h1>
        <p className="text-gray-600 mt-1">
          Design your cake, choose options and get AI recommendations.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
<div
  className="rounded-xl border p-4 space-y-4 hover:shadow-lg"
  style={{ borderColor: LIGHT_PINK }}
>
  {/* DESIGN GENERATOR */}
  <div>
    <div className="font-semibold text-lg">Design Generator</div>

 <div className="mt-3 flex items-center gap-2">
  <input
    className="border rounded px-3 py-2 flex-1 min-w-0"
    placeholder='Example: "pink birthday cake"'
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />

  <button
    onClick={onGenerateDesigns}
    disabled={loadingDesign || !query.trim()}
    className="shrink-0 rounded px-4 py-2 font-medium transition-all duration-200
      hover:brightness-110 hover:shadow-md active:scale-[0.98]
      disabled:opacity-60"
    style={{
      background: PINK,
      color: "white",
      width: 120,
    }}
  >
    {loadingDesign ? "Generating…" : "Generate"}
  </button>
  </div>

  {images.length > 0 && (
  <div className="mt-4 space-y-3">
    {images.map((img, i) => {
      const isSelected = selectedDesignIdx === i;

      return (
        <div
          key={i}
          className={`flex items-center gap-3 border rounded-lg p-2 transition-all
            ${isSelected ? "ring-2 ring-pink-200" : ""}`}
        >
          {/* IMAGE */}
          <img
            src={img}
            alt={`Design ${i + 1}`}
            className="w-24 h-24 object-cover rounded"
          />

          {/* TITLE */}
          <div className="flex-1 text-sm">
            {suggestions[i]?.title}
          </div>

          {/* SELECT / UNSELECT BUTTON */}
          <button
            onClick={() => {
              if (isSelected) {
                setSelectedDesignIdx(null);
              } else {
                setSelectedDesignIdx(i);
                setUploadedImage(null);
                setUploadedImageUrl(null);
              }
            }}
            className="rounded px-3 py-1 text-sm font-medium transition-all"
            style={{
              border: `2px solid ${PINK}`,
              color: isSelected ? "white" : PINK,
              background: isSelected ? PINK : "transparent",
            }}
          >
            {isSelected ? "Unselect" : "Select"}
          </button>
          </div>
      );
    })}
  </div>
)}
</div>

  {/* UPLOAD */}
  <div className="border rounded-xl p-3" style={{ borderColor: LIGHT_PINK }}>
    <div className="font-medium">Upload your own design</div>

    <label
      htmlFor="upload-input"
  className="
    mt-2 inline-block cursor-pointer rounded px-4 py-2 text-sm
    text-white
    transition-all duration-200
    hover:brightness-110 hover:shadow-md
    active:scale-[0.98]
  "
  style={{ background: PINK }}
>
  Choose image
    </label>

    <input
      id="upload-input"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={async (e) => {
  if (!e.target.files?.[0]) return;

  setSelectedDesignIdx(null);

  const file = e.target.files[0];
  setUploadedImage(file);

  const url = await uploadDesignImage(file);
  if (url) setUploadedImageUrl(url);
}}
    />

    {uploadedImage && (
      <div className="mt-3 relative w-fit">
        <img
          src={URL.createObjectURL(uploadedImage)}
          className="w-24 h-24 object-cover rounded border"
          style={{ borderColor: LIGHT_PINK }}
        />
        <button
          onClick={() => {
            setUploadedImage(null);
            setUploadedImageUrl(null);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 text-xs rounded-full bg-white border"
          style={{ borderColor: PINK, color: PINK }}
        >
          ✕
        </button>
      </div>
    )}
  </div>

  {/* NOTES */}
  <div className="border rounded-xl p-3" style={{ borderColor: LIGHT_PINK }}>
    <div className="font-medium">Additional notes</div>
    <textarea
      className="mt-2 w-full border rounded px-3 py-2 text-sm"
      placeholder='Example: "Write Happy Birthday in gold. No nuts."'
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  </div>
</div>

          {/* MIDDLE: PREDICTIVE */}
          <div
            className="rounded-xl border p-4 hover:shadow-lg"
            style={{ borderColor: LIGHT_PINK }}
          >
            <div className="font-semibold text-lg">Predictive AI</div>

            <select className="mt-3 w-full border rounded px-3 py-2" value={season} onChange={(e) => setSeason(e.target.value)}>
              {["Spring", "Summer", "Autumn", "Winter"].map(x => <option key={x}>{x}</option>)}
            </select>

            <select className="mt-3 w-full border rounded px-3 py-2" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              {["Birthday", "Wedding", "Party", "Other"].map(x => <option key={x}>{x}</option>)}
            </select>

            <select className="mt-3 w-full border rounded px-3 py-2" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
              {["Children", "Adults", "Elderly"].map(x => <option key={x}>{x}</option>)}
            </select>

            <button
              onClick={onPredictFlavors}
              className="mt-4 w-full rounded px-4 py-2 text-white hover:brightness-110 hover:shadow-md"
              style={{ background: PINK }}
            >
              {loadingPredict ? "Predicting…" : "Predict flavors"}
            </button>

            {predictedFlavors.map((f, i) => (
              <div key={i} className="mt-3 flex justify-between items-center border rounded p-2" style={{ borderColor: LIGHT_PINK }}>
                <span>{f}</span>
                <button
                  onClick={() => selectFlavorFromAI(f)}
                  className="text-xs rounded px-3 py-1"
                  style={{ border: `1px solid ${LIGHT_PINK}`, color: PINK }}
                >
                  Select
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT: ORDER */}
          <div
            className="rounded-xl border p-4 hover:shadow-lg"
            style={{ borderColor: LIGHT_PINK }}
          >
            <div className="font-semibold text-lg">Order Options</div>

            <select className="mt-3 w-full border rounded px-3 py-2" value={size} onChange={(e) => setSize(e.target.value)}>
              {sizeOptions.map(x => <option key={x}>{x}</option>)}
            </select>

            <select className="mt-3 w-full border rounded px-3 py-2" value={taste} onChange={(e) => setTaste(e.target.value)}>
              {tasteOptions.map(x => <option key={x}>{x}</option>)}
            </select>

            <div className="mt-4 text-sm">
              <div>Design: {selectedDesignTitle}</div>
              <div>Size: {size}</div>
              <div>Taste: {taste} {tastePickedFromAI}</div>
              {price && (
  <div className="mt-2 font-medium">
    Price: <span style={{ color: PINK }}>{price} KM</span>
  </div>
)}
            </div>

            <button
              onClick={onAddToCart}
              className="mt-4 w-full rounded px-4 py-2 transition-all duration-200 hover:bg-[#e7817e] hover:text-white hover:shadow-md active:scale-[0.98]"
              style={{ border: `3px solid ${PINK}`}}
            >
              Add to cart 🛒
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
