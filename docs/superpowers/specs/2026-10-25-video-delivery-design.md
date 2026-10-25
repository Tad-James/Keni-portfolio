# Kenisha Khatri portfolio — production video delivery

## Intent
A static, Vercel-hosted video-editing portfolio where the only remaining
step after launch is **uploading videos**. Six films (intro/showreel, three
podcast edits in Hindi/English/Tamil, a Breaking Bad intro remake, a
multilingual voice-agent SaaS demo) must start fast and play smoothly on any
connection and any viewport. Heavy files never enter GitHub or Vercel.

## Decisions
- **Hosting of video:** Cloudflare Stream (drag-and-drop upload in the
  dashboard → automatic adaptive HLS on a global CDN). The player is
  host-agnostic: each project has a single `video` string that may be a
  Cloudflare Stream ID, an `.m3u8` HLS URL, an `.mp4` URL, or a YouTube/Vimeo
  URL. Switching hosts later is a content edit, not a code change.
- **Player:** native `<video controls>` (best accessibility and mobile
  fullscreen) fed by native HLS on Safari/iOS, or vendored `hls.js` (loaded
  lazily, only when a viewer first shows intent) elsewhere. ABR auto quality,
  capped to the player size.
- **Latency:** poster from the host's thumbnail endpoint; on
  hover/focus/touch of a card we load hls.js and warm the manifest so click →
  first frame is near-instant. Posters lazy-load; nothing video-related loads
  on first paint.
- **Content:** one file, `dist/site-content.js`, drives everything. Sections
  with no data (email, socials, location) are hidden rather than showing
  placeholder text.
- **No build step:** buildless static site, `outputDirectory: dist`.
  Fonts self-hosted, hls.js vendored, strict CSP + security headers in
  `vercel.json`.
- **Verification:** Playwright script serves `dist/`, generates a real
  multi-bitrate HLS fixture with ffmpeg, and checks playback, filters, the
  modal, and layout overflow at phone/tablet/desktop viewports.

## Out of scope
Contact form backend, CMS, analytics, custom domain DNS (documented only).
