import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Suggestion = {
  title: string;
  prompt: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userQuery: string = (body?.query || "").trim();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    if (!userQuery) {
      return Response.json({ error: "Empty query" }, { status: 400 });
    }

    /* ------------------------------------------------------------------
       1) TAČNO 3 DIZAJNA (S A M O title + prompt)
    ------------------------------------------------------------------ */
    const textRes = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
You are a cake design assistant.

Generate EXACTLY 3 DIFFERENT cake design concepts for the user's request.

IMPORTANT:
- Each design MUST be visually different (style, decoration, structure).
- Use different design styles:
  1) Minimal / elegant
  2) Playful / decorative
  3) Aesthetic but still decorative, not plain like minimalism

Return ONLY valid JSON in this format:
{
  "suggestions": [
    { "title": "...", "prompt": "..." },
    { "title": "...", "prompt": "..." },
    { "title": "...", "prompt": "..." }
  ]
}

Rules:
- suggestions length MUST be exactly 3
- title: short design name
- prompt: detailed prompt for cake image generation
- NO prices
- NO descriptions
- NO extra text
          `.trim(),
        },
        {
          role: "user",
          content: `User request: "${userQuery}"`,
        },
      ],
    });

    const text = textRes.output_text || "";
    let parsed: { suggestions: Suggestion[] };

    try {
      parsed = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "AI did not return valid JSON", raw: text },
        { status: 500 }
      );
    }

    const suggestions = parsed?.suggestions || [];
    if (suggestions.length !== 3) {
      return Response.json(
        { error: "AI did not return exactly 3 designs", raw: parsed },
        { status: 500 }
      );
    }

    /* ------------------------------------------------------------------
       2) GENERIŠI 3 SLIKE — SVAKU POSEBNO (KLJUČ ZA RAZLIČITOST)
    ------------------------------------------------------------------ */
    const images: string[] = [];

    for (const s of suggestions) {
      const imgRes = await openai.images.generate({
        model: "gpt-image-1",
        prompt: `
Realistic professional product photo of a cake.
Studio lighting, clean background.
${s.prompt}
Different from other designs.
        `.trim(),
        size: "1024x1024",
      });

      const img = imgRes.data?.[0]?.b64_json;
      if (!img) {
        return Response.json(
          { error: "Failed to generate image for design", design: s.title },
          { status: 500 }
        );
      }

      images.push(img);
    }

    /* ------------------------------------------------------------------ */
    return Response.json({
      suggestions, // [{ title, prompt }]
      images,      // 3 base64 PNGs (REDOSLIJED SE POKLAPA)
    });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
