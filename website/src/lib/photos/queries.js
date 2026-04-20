import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getPublicPhotoSections() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("photo_folders")
      .select(
        "id,name,slug,description,sort_order,photos(id,public_url,alt_text,sort_order)",
      )
      .eq("is_public", true)
      .order("sort_order", { ascending: true })
      .order("sort_order", { foreignTable: "photos", ascending: true });

    if (error) {
      return [];
    }

    return (data ?? []).map((folder) => ({
      ...folder,
      photos: folder.photos ?? [],
    }));
  } catch {
    return [];
  }
}
