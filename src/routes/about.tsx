import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PLAIN — Our Story & Craft" },
      {
        name: "description",
        content:
          "PLAIN makes heavyweight organic cotton essentials with transparent pricing and ethical production. Read the story behind the label.",
      },
      { property: "og:title", content: "About PLAIN" },
      { property: "og:description", content: "The story behind PLAIN essentials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { settings } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PageHero kicker="Our story" title={settings.aboutTitle} subtitle={settings.tagline} />
        <div className="mx-auto max-w-5xl px-4 py-20 md:px-8">
          {settings.aboutImage && (
            <img loading="lazy" decoding="async"
              src={settings.aboutImage}
              alt="Inside the PLAIN studio"
              className="aspect-[16/9] w-full object-cover"
            />
          )}
          <div className="mt-10 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {settings.aboutBody}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
