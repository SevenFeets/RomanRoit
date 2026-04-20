"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const nextUrl = searchParams.get("next") || "/admin";
  const hasUnauthorizedError = searchParams.get("error") === "unauthorized";

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, next: nextUrl }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || "Could not send login link.");
      return;
    }

    setStatus("success");
    setMessage("Magic link sent. Check your email inbox.");
  }

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Admin Access
      </p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-2 text-slate-600">
        Use your allowlisted email to receive a magic login link.
      </p>

      {hasUnauthorizedError ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          This email is not authorized for admin access.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-emerald-200 transition focus:border-emerald-500 focus:ring"
            placeholder="you@example.com"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            status === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
