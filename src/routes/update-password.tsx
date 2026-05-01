import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/update-password")({
  component: UpdatePasswordPage,
});

type FieldErrors = Partial<{
  password: string;
  confirmPassword: string;
}>;

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const hasCode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URL(window.location.href).searchParams.has("code");
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        // Some Supabase setups use ?code=... (PKCE). Exchange it for a session.
        if (typeof window !== "undefined" && hasCode) {
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              setError(exchangeError.message);
            }
          }
        }
      } finally {
        if (active) setReady(true);
      }
    }

    void init();
    return () => {
      active = false;
    };
  }, [hasCode]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const nextErrors: FieldErrors = {};
    if (!password) nextErrors.password = "Please enter a new password.";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your new password.";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. You can now sign in.");
    void navigate({ to: "/signin" });
  }

  return (
    <div className="bg-olive text-cream min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-cream/5 border border-cream/20 p-8 lg:p-10">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">Account</p>
        <h1 className="font-serif text-5xl leading-none">Set New Password</h1>
        <p className="mt-4 text-cream/80">Choose a new password for your account.</p>

        {!ready ? (
          <p className="mt-10 text-sm text-cream/80">Loading…</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-luxe mb-2">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className="w-full h-12 px-4 pr-20 bg-transparent border border-cream/35 focus:border-coral outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-luxe text-cream/80 hover:text-cream"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-300">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-luxe mb-2">Confirm new password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className="w-full h-12 px-4 pr-20 bg-transparent border border-cream/35 focus:border-coral outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-luxe text-cream/80 hover:text-cream"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-xs text-red-300">{errors.confirmPassword}</p>}
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {message && <p className="text-sm text-green-300">{message}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-cream/80">
          Back to <Link to="/signin" className="link-underline text-coral">sign in</Link>
        </p>
      </div>
    </div>
  );
}

