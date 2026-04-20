import Link from "next/link";

import SignOutButton from "@/components/admin/SignOutButton";
import { requireAllowlistedUser } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const user = await requireAllowlistedUser();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Admin Panel
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              Welcome, {user.email}
            </h1>
            <p className="mt-2 text-slate-600">
              Manage contact submissions and photo sections from here.
            </p>
          </div>

          <SignOutButton />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/contacts"
            className="rounded-2xl border border-slate-200 p-6 transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <h2 className="text-lg font-bold text-slate-900">Contacts</h2>
            <p className="mt-2 text-sm text-slate-600">
              Review submitted contact requests and follow up quickly.
            </p>
          </Link>

          <Link
            href="/admin/photos"
            className="rounded-2xl border border-slate-200 p-6 transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <h2 className="text-lg font-bold text-slate-900">Photo Sections</h2>
            <p className="mt-2 text-sm text-slate-600">
              Create folders and manage photo order for public sections.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
