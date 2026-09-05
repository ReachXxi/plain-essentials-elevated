# Upload videos for product previews

Right now a product's live preview only accepts a video link (YouTube, TikTok, X, Vimeo, a direct file URL). This adds the ability to upload a video file straight from the admin panel, so the preview plays your own footage.

## What changes

- In the admin product editor, the "Video URL" field becomes a combined control: paste a link, or choose "Upload video" to pick a file from your device.
- After upload finishes, the field fills in automatically with the stored video address, and a small "Remove" action clears it.
- A progress state shows while the file uploads, and oversized or non-video files are rejected with a clear message.
- The same upload option is added to the gallery hero video field, so gallery background video can be uploaded too.
- The product card live view and the product details page preview already handle direct video files, so uploaded videos autoplay with controls without further changes.

## Limits

- Accepted types: MP4, WebM, MOV, OGG.
- Maximum size: 50 MB per video (larger files should still be hosted on YouTube/Vimeo and pasted as a link).

## Technical notes

- Existing image uploads send a base64 data URL through `adminUpload`, capped near 9 MB — too small and too memory-heavy for video.
- Add a protected server function `adminUploadUrl` in `src/lib/plain.functions.ts` that verifies the admin password and returns a signed upload URL plus the final path from the private `media` bucket (`createSignedUploadUrl` in `src/lib/plain.server.ts`).
- The browser uploads the file bytes directly to that signed URL, then stores `/api/public/media/<path>` in `video_url`.
- Add a reusable `MediaUploadField` in the admin route that wraps the existing text input with a file picker, validation, progress state, and clear action.
- Serving is unchanged: the existing `/api/public/media/$` route streams the file with correct content type and range support; confirm range handling so scrubbing works, and add it if missing.
