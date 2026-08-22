import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useStore } from "@/lib/store";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact PLAIN — Orders, Sizing & Support" },
      {
        name: "description",
        content:
          "Reach the PLAIN team on WhatsApp or email for orders, sizing advice, shipping questions and wholesale enquiries.",
      },
      { property: "og:title", content: "Contact PLAIN" },
      { property: "og:description", content: "Talk to the PLAIN team on WhatsApp or email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { settings } = useStore();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const send = () => {
    const text = `Hello ${settings.brand},\n\nName: ${name.trim().slice(0, 100)}\n\n${message
      .trim()
      .slice(0, 1000)}`;
    window.open(whatsappLink(settings.whatsapp, text), "_blank", "noopener");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-5xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8">
        <div>
          <h1 className="font-display text-5xl md:text-6xl">{settings.contactTitle}</h1>
          <p className="mt-6 whitespace-pre-line text-sm text-muted-foreground">
            {settings.contactBody}
          </p>
          <ul className="mt-8 space-y-2 font-accent text-[11px]">
            {settings.contactPhone && <li>{settings.contactPhone}</li>}
            {settings.contactEmail && <li>{settings.contactEmail}</li>}
            {settings.contactAddress && <li>{settings.contactAddress}</li>}
          </ul>
        </div>
        <div className="space-y-3 border bg-card p-6">
          <Input
            placeholder="Your name"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="How can we help?"
            maxLength={1000}
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            className="h-12 w-full font-accent text-[11px]"
            disabled={!name.trim() || !message.trim()}
            onClick={send}
          >
            Send on WhatsApp
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
