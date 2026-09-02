import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — PLAIN" },
      {
        name: "description",
        content: "Your PLAIN account: saved pieces, wishlist and contact details.",
      },
      { property: "og:title", content: "My Account — PLAIN" },
      { property: "og:description", content: "Your PLAIN customer account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const { wishlist, products } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h1 className="font-display text-5xl rise-in">My account</h1>
        <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="font-accent text-[10px]" onClick={() => void signOut()}>
            Sign out
          </Button>
          <Link
            to="/"
            className="inline-flex items-center border px-4 py-2 font-accent text-[10px]"
          >
            Continue shopping
          </Link>
        </div>

        <h2 className="mt-14 font-display text-3xl">Wishlist</h2>
        {saved.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing saved yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
