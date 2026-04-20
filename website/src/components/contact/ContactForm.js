"use client";

import { useState } from "react";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  message: "",
  company: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    const payload = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error || "Could not send your message.");
      return;
    }

    setStatus("success");
    setMessage("Thank you. Your message was received.");
    setForm(INITIAL_FORM);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-300">Phone (optional)</span>
        <input
          type="text"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring"
        />
      </label>

      <label className="hidden">
        <span>Company</span>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-300">Message</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>

      {message ? (
        <p
          className={`rounded-xl px-3 py-2 text-sm ${
            status === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border border-rose-400/30 bg-rose-500/10 text-rose-200"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
