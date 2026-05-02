import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/update-password")({
  component: UpdatePasswordPage,
});

type FieldErrors = Partial<{
  password: string;
  confirmPassword: string;
}>;

function stripRecoveryParamsFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("code");
  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}

async function establishRecoverySession(): Promise<{ error?: string }> {
  if (typeof window === "undefined") return {};

  const url = new URL(window.location.href);

  // 1) token_hash recovery link — works even when email opens on another browser/device (recommended).
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (token_hash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "recovery",
    });
    if (error) return { error: error.message };
    stripRecoveryParamsFromUrl();
    return {};
  }

  // 2) Implicit-style recovery link: #access_token=...&refresh_token=...
  const rawHash = window.location.hash.replace(/^#/, "");
  if (rawHash) {
    const hashParams = new URLSearchParams(rawHash);
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) return { error: error.message };
      stripRecoveryParamsFromUrl();
      return {};
    }
  }

  // 3) PKCE-style recovery link: ?code=... — only works in the SAME browser that requested the reset.
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const msg = error.message ?? "";
      if (msg.includes("code verifier") || msg.includes("PKCE")) {
        return {
          error:
            "This reset link was opened in a different browser than where you requested it. Request a new reset email and open it in this browser, or change your Supabase reset template so the button links to {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery (instead of {{ .ConfirmationURL }}).",
        };
      }
      return { error: msg };
    }
    stripRecoveryParamsFromUrl();
    return {};
  }

  return {};
}

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

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const { error: sessionError } = await establishRecoverySession();
        if (!active) return;
        if (sessionError) setError(sessionError);
      } finally {
        if (active) setReady(true);
      }
    }

    void init();
    return () => {
      active = false;
    };
  }, []);

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
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError(
          "Your reset link is invalid or expired. Request a new reset email and open the link again.",
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Password updated. You can now sign in.");
      await supabase.auth.signOut();
      void navigate({ to: "/signin" });
    } finally {
      setLoading(false);
    }
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
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-300">{errors.confirmPassword}</p>
              )}
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
          {" · "}
          <Link to="/reset-password" className="link-underline text-coral">
            Request new link
          </Link>
        </p>
      </div>
    </div>
  );
}
