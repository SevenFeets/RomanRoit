import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(payload) {
  const name = normalizeText(payload?.name);
  const email = normalizeText(payload?.email).toLowerCase();
  const phone = normalizeText(payload?.phone);
  const message = normalizeText(payload?.message);
  const honey = normalizeText(payload?.company);

  if (honey) {
    return { error: "Invalid form submission." };
  }

  if (!name || name.length < 2 || name.length > 80) {
    return { error: "Name must be between 2 and 80 characters." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!message || message.length < 10 || message.length > 2000) {
    return { error: "Message must be between 10 and 2000 characters." };
  }

  if (phone.length > 40) {
    return { error: "Phone number is too long." };
  }

  return { name, email, phone, message };
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const validated = validatePayload(payload);

    if (validated.error) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      message: validated.message,
    });

    if (error) {
      return NextResponse.json(
        { error: "Could not save your request. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unexpected request format." },
      { status: 400 },
    );
  }
}
