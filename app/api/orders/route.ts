import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const size = formData.get("size") as string | null;
    const taste = formData.get("taste") as string | null;
    const season = formData.get("season") as string | null;
    const occasion = formData.get("occasion") as string | null;
    const age_group = formData.get("ageGroup") as string | null;
    const notes = formData.get("notes") as string | null;

    const designType = formData.get("designType") as string | null;
    const design_title = formData.get("designTitle") as string | null;
    const aiImage = formData.get("aiImage") as string | null;

    let design_images: string[] = [];

    // 👉 UPLOAD (niži prioritet)
    if (designType === "upload") {
      const files = formData.getAll("files") as File[];

      for (const file of files) {
        const ext = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("cake-designs")
          .upload(fileName, file);

        if (uploadError) {
          console.error(uploadError);
          return NextResponse.json(
            { error: "Image upload failed" },
            { status: 400 }
          );
        }

        const { data } = supabase.storage
          .from("cake-designs")
          .getPublicUrl(fileName);

        design_images.push(data.publicUrl);
      }
    }

    // 👉 AI DESIGN (IMA PRIORITET)
    if (designType === "ai" && aiImage) {
      design_images = [aiImage];
    }

    const { error } = await supabase.from("cake_orders").insert({
      size,
      taste,
      season,
      occasion,
      age_group,
      notes,
      design_type: designType,
      design_title,
      design_images,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
