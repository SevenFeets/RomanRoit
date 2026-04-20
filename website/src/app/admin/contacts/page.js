import Link from "next/link";

import { requireAllowlistedUser } from "@/lib/auth/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  await requireAllowlistedUser();

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("id,name,email,phone,message,created_at")
    .order("created_at", { ascending: false });

  const contacts = data ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contact Requests</h1>
          <p className="mt-1 text-sm text-slate-600">
            All messages submitted from the contact form.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Back to Admin
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {contacts.length ? (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((contact) => (
                <tr key={contact.id} className="align-top">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(contact.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {contact.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{contact.email}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {contact.phone || "-"}
                  </td>
                  <td className="max-w-md whitespace-pre-wrap px-4 py-3 text-slate-700">
                    {contact.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-10 text-center text-slate-600">
            No contact submissions yet.
          </div>
        )}
      </div>
    </main>
  );
}
