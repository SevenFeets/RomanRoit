import { NextResponse } from "next/server";

import { isEmailAllowlisted } from "@/lib/auth/allowlist";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { email, next } = await request.json();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    if (!isEmailAllowlisted(normalizedEmail)) {
      return NextResponse.json(
        { error: "This email is not allowlisted for admin access." },
        { status: 403 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.searchParams.set("next", next || "/admin");

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send magic link." },
      { status: 500 },
    );
  }
}
