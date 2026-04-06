"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-6" style={{ textDecoration: "none" }}>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto font-bold text-sm"
              style={{
                background: "var(--md-sys-color-primary)",
                color: "var(--md-sys-color-on-primary)",
              }}
            >
              AF
            </div>
          </Link>
          <h1
            className="text-xl font-bold mb-1"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            Sign in
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            Agent Factory Research
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="rounded-xl p-6"
            style={{
              background: "#ffffff",
              border: "1px solid var(--md-sys-color-outline)",
              boxShadow: "var(--elevation-1)",
            }}
          >
            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  background: "var(--score-low-bg)",
                  color: "var(--score-low)",
                  border: "1px solid var(--score-low)",
                }}
              >
                {error}
              </div>
            )}

            <label className="block mb-4">
              <span
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                autoFocus
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--md-sys-color-surface-variant)",
                  color: "var(--md-sys-color-on-surface)",
                  border: "1px solid var(--md-sys-color-outline)",
                }}
                placeholder="you@example.com"
              />
            </label>

            <label className="block mb-6">
              <span
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--md-sys-color-surface-variant)",
                  color: "var(--md-sys-color-on-surface)",
                  border: "1px solid var(--md-sys-color-outline)",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              style={{
                background: "var(--md-sys-color-primary)",
                color: "var(--md-sys-color-on-primary)",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
