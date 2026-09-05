import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        const buf = await data.arrayBuffer();
        const type = data.type || "application/octet-stream";
        const range = request.headers.get("range");
        const m = range?.match(/bytes=(\d*)-(\d*)/);
        if (m) {
          const start = m[1] ? Number(m[1]) : 0;
          const end = m[2] ? Number(m[2]) : buf.byteLength - 1;
          if (start < buf.byteLength && end >= start) {
            const slice = buf.slice(start, end + 1);
            return new Response(slice, {
              status: 206,
              headers: {
                "Content-Type": type,
                "Content-Range": `bytes ${start}-${end}/${buf.byteLength}`,
                "Accept-Ranges": "bytes",
                "Content-Length": String(slice.byteLength),
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          }
        }
        return new Response(buf, {
          headers: {
            "Content-Type": type,
            "Accept-Ranges": "bytes",
            "Content-Length": String(buf.byteLength),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
