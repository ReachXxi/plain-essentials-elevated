import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageHero } from "@/components/site/PageHero";
import { useStore } from "@/lib/store";
import { embedUrl } from "@/lib/site";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — PLAIN Lookbook & Campaigns" },
      {
        name: "description",
        content:
          "Browse the PLAIN gallery: campaign imagery, lookbook shots and behind-the-scenes films from our essentials collection.",
      },
      { property: "og:title", content: "Gallery — PLAIN" },
      { property: "og:description", content: "Campaign imagery and films from PLAIN." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { gallery, settings } = useStore();
  const video = embedUrl(settings.galleryHeroVideo, {
    autoplay: true,
    loop: true,
    muted: true,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PageHero
          kicker="Lookbook"
          title={settings.galleryHeroTitle}
          subtitle={settings.galleryHeroSubtitle}
          overlay={
            <>
              {video?.kind === "video" && (
                <video
                  src={video.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {video?.kind === "iframe" && (
                <iframe
                  src={video.src}
                  title="Gallery film"
                  allow="autoplay; loop; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[180%] -translate-x-1/2 -translate-y-1/2"
                />
              )}
            </>
          }
        />

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g) => (
              <figure key={g.id} className="group relative overflow-hidden">
                <img
                  src={g.image_url}
                  alt={g.title || "PLAIN gallery image"}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 to-transparent p-5 text-ink-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <p className="font-display text-xl">{g.title}</p>
                  <p className="mt-1 text-xs text-ink-foreground/70">{g.description}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          {gallery.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Gallery images coming soon.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
