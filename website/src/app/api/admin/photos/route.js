import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";

import { requireAllowlistedApiUser } from "@/lib/auth/api";
import {
  buildPhotoStoragePath,
  slugifyFolderName,
} from "@/lib/photos/helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "photo-sections";

function toInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback = true) {
  if (value === "true" || value === true) {
    return true;
  }

  if (value === "false" || value === false) {
    return false;
  }

  return fallback;
}

export async function GET() {
  const auth = await requireAllowlistedApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("photo_folders")
    .select(
      "id,name,slug,description,sort_order,is_public,photos(id,public_url,storage_path,alt_text,sort_order)",
    )
    .order("sort_order", { ascending: true })
    .order("sort_order", { foreignTable: "photos", ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Could not load folders." },
      { status: 500 },
    );
  }

  return NextResponse.json({ folders: data ?? [] });
}

export async function POST(request) {
  const auth = await requireAllowlistedApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const supabase = createSupabaseAdminClient();
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "create-folder") {
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const sortOrder = toInteger(formData.get("sortOrder"), 0);
    const isPublic = toBoolean(formData.get("isPublic"), true);
    const slug = slugifyFolderName(String(formData.get("slug") || name));

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Folder name is required." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("photo_folders")
      .insert({
        name,
        slug,
        description: description || null,
        sort_order: sortOrder,
        is_public: isPublic,
      })
      .select("id,name,slug,description,sort_order,is_public")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Could not create folder. Check if slug is unique." },
        { status: 400 },
      );
    }

    return NextResponse.json({ folder: data });
  }

  if (action === "upload-photo") {
    const folderId = toInteger(formData.get("folderId"));
    const altText = String(formData.get("altText") || "").trim();
    const sortOrder = toInteger(formData.get("sortOrder"), 0);
    const file = formData.get("file");

    if (!folderId) {
      return NextResponse.json({ error: "Folder is required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const { data: folder, error: folderError } = await supabase
      .from("photo_folders")
      .select("id,slug")
      .eq("id", folderId)
      .single();

    if (folderError || !folder) {
      return NextResponse.json({ error: "Folder not found." }, { status: 404 });
    }

    const storagePath = buildPhotoStoragePath(folder.slug, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Could not upload image to storage." },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

    const { data: photo, error: photoError } = await supabase
      .from("photos")
      .insert({
        folder_id: folderId,
        storage_path: storagePath,
        public_url: publicUrl,
        alt_text: altText || null,
        sort_order: sortOrder,
      })
      .select("id,folder_id,public_url,storage_path,alt_text,sort_order")
      .single();

    if (photoError) {
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      return NextResponse.json(
        { error: "Could not save photo metadata." },
        { status: 500 },
      );
    }

    return NextResponse.json({ photo });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}

export async function PATCH(request) {
  const auth = await requireAllowlistedApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const supabase = createSupabaseAdminClient();
  const payload = await request.json();

  if (payload.action === "update-folder") {
    const folderId = toInteger(payload.folderId);
    const name = String(payload.name || "").trim();
    const slug = slugifyFolderName(String(payload.slug || name));
    const description = String(payload.description || "").trim();
    const sortOrder = toInteger(payload.sortOrder, 0);
    const isPublic = toBoolean(payload.isPublic, true);

    if (!folderId || !name || !slug) {
      return NextResponse.json(
        { error: "Folder id, name and slug are required." },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("photo_folders")
      .update({
        name,
        slug,
        description: description || null,
        sort_order: sortOrder,
        is_public: isPublic,
      })
      .eq("id", folderId);

    if (error) {
      return NextResponse.json(
        { error: "Could not update folder." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (payload.action === "reorder-photo") {
    const photoId = toInteger(payload.photoId);
    const sortOrder = toInteger(payload.sortOrder, 0);

    if (!photoId) {
      return NextResponse.json({ error: "Photo id is required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("photos")
      .update({ sort_order: sortOrder })
      .eq("id", photoId);

    if (error) {
      return NextResponse.json(
        { error: "Could not update photo order." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}

export async function DELETE(request) {
  const auth = await requireAllowlistedApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const supabase = createSupabaseAdminClient();
  const payload = await request.json();

  if (payload.action === "delete-photo") {
    const photoId = toInteger(payload.photoId);

    if (!photoId) {
      return NextResponse.json({ error: "Photo id is required." }, { status: 400 });
    }

    const { data: photo, error: photoLoadError } = await supabase
      .from("photos")
      .select("id,storage_path")
      .eq("id", photoId)
      .single();

    if (photoLoadError || !photo) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }

    await supabase.storage.from(BUCKET_NAME).remove([photo.storage_path]);

    const { error } = await supabase.from("photos").delete().eq("id", photoId);
    if (error) {
      return NextResponse.json(
        { error: "Could not delete photo." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (payload.action === "delete-folder") {
    const folderId = toInteger(payload.folderId);

    if (!folderId) {
      return NextResponse.json({ error: "Folder id is required." }, { status: 400 });
    }

    const { data: photos } = await supabase
      .from("photos")
      .select("storage_path")
      .eq("folder_id", folderId);

    const storagePaths = (photos ?? [])
      .map((photo) => photo.storage_path)
      .filter(Boolean);

    if (storagePaths.length) {
      await supabase.storage.from(BUCKET_NAME).remove(storagePaths);
    }

    const { error } = await supabase
      .from("photo_folders")
      .delete()
      .eq("id", folderId);

    if (error) {
      return NextResponse.json(
        { error: "Could not delete folder." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
