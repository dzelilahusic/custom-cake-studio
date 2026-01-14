import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ MORA BITI ISTO kao tasteOptions u page.tsx
const AVAILABLE_FLAVORS = [
"Vanilla", 
"Chocolate", 
"Strawberry", 
"Vanilla - Raspberry", 
"Oreo", 
"Coconut", 
"Choco - Pistachio", 
"Lemon", 
"Choco - Hazelnut",
];

export async function POST(req: Request) {
  try {
    const { season, occasion, ageGroup } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const system = `
You are a predictive AI for a cake ordering system.

Goal:
Recommend cake flavors ONLY from the allowed list, based on:
- season
- occasion
- age group

Allowed flavors (STRICT — do not invent new ones):
${AVAILABLE_FLAVORS.join(", ")}

Rules:
- Return EXACTLY 3 different flavors.
- Use ONLY flavors from the allowed list.
- Adjust choices based on season, occasion, and age group.
- If occasion is "Other", base recommendations only on season + age group.
- No long explanations.

Output format (JSON ONLY):
{
  "recommended": ["Flavor 1", "Flavor 2", "Flavor 3"]
}
`.trim();

    const user = `
Inputs:
- season: ${season}
- occasion: ${occasion}
- ageGroup: ${ageGroup}

Return JSON only.
`.trim();

    const res = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = res.output_text || "";
    let parsed: any;

    try {
      parsed = JSON.parse(text);
    } catch {
      return Response.json({ error: "Invalid JSON from AI", raw: text }, { status: 500 });
    }

    if (!Array.isArray(parsed?.recommended) || parsed.recommended.length !== 3) {
      return Response.json(
        { error: "AI did not return exactly 3 flavors", raw: parsed },
        { status: 500 }
      );
    }

    const safeFlavors = parsed.recommended.filter((f: string) => AVAILABLE_FLAVORS.includes(f));

    if (safeFlavors.length !== 3) {
      return Response.json(
        { error: "AI returned invalid flavors", raw: parsed },
        { status: 500 }
      );
    }

    // ✅ VRATI KEY KOJI FRONTEND OČEKUJE
    return Response.json({
      flavors: safeFlavors, // <-- ovo je bitno
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
