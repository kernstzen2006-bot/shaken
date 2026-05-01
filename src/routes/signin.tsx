import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      void navigate({ to: "/" });
    }
  }, [navigate, user]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    void navigate({ to: "/" });
  }

  return (
    <div className="bg-olive text-cream min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-cream/5 border border-cream/20 p-8 lg:p-10">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">Account</p>
        <h1 className="font-serif text-5xl leading-none">Sign In</h1>
        <p className="mt-4 text-cream/80">Access your account and wishlist.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-luxe mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-transparent border border-cream/35 focus:border-coral outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-luxe mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-transparent border border-cream/35 focus:border-coral outline-none"
            />
            <div className="mt-2 flex justify-end">
              <Link to="/reset-password" className="text-[11px] uppercase tracking-luxe link-underline text-cream/85 hover:text-cream">
                Reset password
              </Link>
            </div>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-sm text-cream/80">
          New here? <Link to="/signup" className="link-underline text-coral">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
