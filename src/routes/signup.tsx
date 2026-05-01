import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
});

type FieldErrors = Partial<{
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  terms: string;
}>;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function SignUpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (user) {
      void navigate({ to: "/" });
    }
  }, [navigate, user]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setMessage(null);
    setCanResend(false);

    const nextErrors: FieldErrors = {};
    if (!fullName.trim()) nextErrors.fullName = "Please enter your full name.";
    if (!email.trim()) nextErrors.email = "Please enter your email address.";
    else if (!isValidEmail(email)) nextErrors.email = "Please enter a valid email address.";
    if (!password) nextErrors.password = "Please enter a password.";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match.";
    if (!dateOfBirth) nextErrors.dateOfBirth = "Please enter your date of birth.";
    if (!agreeTerms) nextErrors.terms = "You must agree to the Terms & Conditions.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);

    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/signin`
        : undefined;

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth,
          newsletter_opt_in: newsletterOptIn,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setSubmitError(signUpError.message);
      return;
    }

    // With email confirmation enabled, Supabase returns no session until confirmed.
    // `data.user` should still exist if the account was created successfully.
    if (!data.user) {
      setMessage("Sign up submitted. If you don’t receive an email, your Supabase email/SMTP settings may be blocking delivery.");
      setCanResend(true);
      return;
    }

    setMessage("Account created. Check your email (and spam) to confirm your account, then sign in.");
    setCanResend(true);
  }

  return (
    <div className="bg-olive text-cream min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-cream/5 border border-cream/20 p-8 lg:p-10">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">Account</p>
        <h1 className="font-serif text-5xl leading-none">Sign Up</h1>
        <p className="mt-4 text-cream/80">Create your SHAKEN account.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-luxe mb-2">Full name</label>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              className="w-full h-12 px-4 bg-transparent border border-cream/35 focus:border-coral outline-none"
            />
            {errors.fullName && <p className="mt-2 text-xs text-red-300">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-luxe mb-2">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="w-full h-12 px-4 bg-transparent border border-cream/35 focus:border-coral outline-none"
            />
            {errors.email && <p className="mt-2 text-xs text-red-300">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-luxe mb-2">Password</label>
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
            <label className="block text-[11px] uppercase tracking-luxe mb-2">Confirm password</label>
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

          <div>
            <label className="block text-[11px] uppercase tracking-luxe mb-2">Date of birth</label>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                setErrors((prev) => ({ ...prev, dateOfBirth: undefined }));
              }}
              className="w-full h-12 px-4 bg-transparent border border-cream/35 focus:border-coral outline-none"
            />
            {errors.dateOfBirth && <p className="mt-2 text-xs text-red-300">{errors.dateOfBirth}</p>}
          </div>

          <div className="flex items-start gap-3">
            <input
              id="newsletter-opt-in"
              type="checkbox"
              checked={newsletterOptIn}
              onChange={(e) => setNewsletterOptIn(e.target.checked)}
              className="mt-1 h-4 w-4 accent-coral"
            />
            <label htmlFor="newsletter-opt-in" className="text-sm text-cream/85">
              I want to receive the newsletter.
            </label>
          </div>

          <div>
            <div className="flex items-start gap-3">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  setErrors((prev) => ({ ...prev, terms: undefined }));
                }}
                className="mt-1 h-4 w-4 accent-coral"
              />
              <label htmlFor="agree-terms" className="text-sm text-cream/85">
                I agree to the Terms &amp; Conditions
              </label>
            </div>
            {errors.terms && <p className="mt-2 text-xs text-red-300">{errors.terms}</p>}
          </div>

          {submitError && <p className="text-sm text-red-300">{submitError}</p>}
          {message && <p className="text-sm text-green-300">{message}</p>}

          {canResend && (
            <button
              type="button"
              className="w-full border border-cream/35 h-12 text-[11px] uppercase tracking-luxe hover:border-coral transition-colors"
              disabled={loading || resending}
              onClick={async () => {
                setSubmitError(null);
                setMessage(null);
                setResending(true);
                const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
                setResending(false);
                if (error) {
                  setSubmitError(error.message);
                  return;
                }
                setMessage("Confirmation email resent. Check your inbox (and spam).");
              }}
            >
              {resending ? "Resending..." : "Resend confirmation email"}
            </button>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-cream/80">
          Already registered? <Link to="/signin" className="link-underline text-coral">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
