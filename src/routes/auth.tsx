import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PLAIN Customer Accounts" },
      {
        name: "description",
        content:
          "Create a PLAIN account to track your orders, save your wishlist and check out faster on WhatsApp.",
      },
      { property: "og:title", content: "Sign in — PLAIN" },
      { property: "og:description", content: "Create a PLAIN customer account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/account" });
  }, [loading, user, navigate]);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome to PLAIN");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      }
      void navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
    setBusy(false);
  };

  const google = async () => {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch {
      toast.error("Google sign-in unavailable");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-16">
      <div className="w-full max-w-md space-y-5 border border-white/10 bg-background p-8 rise-in">
        <Link to="/" className="font-accent text-[10px] text-muted-foreground">
          ← {settings.brand}
        </Link>
        <h1 className="font-display text-4xl">
          {mode === "signup" ? "Create account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Track orders, keep your wishlist and check out faster.
        </p>

        <Button
          variant="outline"
          className="h-11 w-full font-accent text-[10px]"
          onClick={() => void google()}
        >
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span className="font-accent text-[9px]">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {mode === "signup" && (
          <div>
            <Label className="font-accent text-[10px]">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div>
          <Label className="font-accent text-[10px]">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <Label className="font-accent text-[10px]">Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
          />
        </div>

        <Button
          className="h-11 w-full font-accent text-[10px]"
          disabled={busy}
          onClick={() => void submit()}
        >
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>

        <button
          className="w-full font-accent text-[10px] text-muted-foreground underline"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup" ? "I already have an account" : "I need an account"}
        </button>
      </div>
    </div>
  );
}
