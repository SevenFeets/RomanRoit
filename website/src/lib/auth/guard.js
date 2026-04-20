import { redirect } from "next/navigation";

import { isEmailAllowlisted } from "@/lib/auth/allowlist";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAllowlistedUser(redirectTo = "/login") {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${redirectTo}?next=/admin`);
  }

  if (!isEmailAllowlisted(user.email)) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return user;
}
