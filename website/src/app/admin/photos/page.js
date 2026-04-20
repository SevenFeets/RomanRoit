import Link from "next/link";

import AdminPhotosManager from "@/components/admin/AdminPhotosManager";
import { requireAllowlistedUser } from "@/lib/auth/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  await requireAllowlistedUser();

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("photo_folders")
    .select(
      "id,name,slug,description,sort_order,is_public,photos(id,public_url,storage_path,alt_text,sort_order)",
    )
    .order("sort_order", { ascending: true })
    .order("sort_order", { foreignTable: "photos", ascending: true });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Photo Sections</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create folder-style sections and manage photos in each section.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Back to Admin
        </Link>
      </div>

      <AdminPhotosManager initialFolders={data ?? []} />
    </main>
  );
}
