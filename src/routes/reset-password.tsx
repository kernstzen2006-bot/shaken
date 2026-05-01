import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("If an account exists for that email, a reset link has been sent.");
  }

  return (
    <div className="bg-olive text-cream min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-cream/5 border border-cream/20 p-8 lg:p-10">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">Account</p>
        <h1 className="font-serif text-5xl leading-none">Reset Password</h1>
        <p className="mt-4 text-cream/80">We’ll email you a link to set a new password.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-luxe mb-2">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-transparent border border-cream/35 focus:border-coral outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {message && <p className="text-sm text-green-300">{message}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-sm text-cream/80">
          Remembered it? <Link to="/signin" className="link-underline text-coral">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

