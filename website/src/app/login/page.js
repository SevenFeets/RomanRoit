import { Suspense } from "react";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-6 py-16">
      <Suspense
        fallback={
          <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-600">Loading login form...</p>
          </section>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
