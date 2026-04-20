import { NextResponse } from "next/server";

import { requireAllowlistedApiUser } from "@/lib/auth/api";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireAllowlistedApiUser();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id,name,email,phone,message,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Could not load contact submissions." },
      { status: 500 },
    );
  }

  return NextResponse.json({ contacts: data ?? [] });
}
