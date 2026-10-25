/*
 * ─────────────────────────────────────────────────────────────────────────
 *  EVERYTHING you ever need to edit lives in this file.
 *
 *  ADDING A VIDEO (Cloudflare Stream — the simple way)
 *    1. Upload the file in dash.cloudflare.com → Stream → Videos.
 *    2. Copy the video's ID (32 letters/numbers) into that project's `video`.
 *    3. Set `cloudflareCustomerCode` ONCE (see below). Done — no re-encoding,
 *       no thumbnails to make: adaptive streaming + posters are automatic.
 *
 *  `video` also accepts: a full .m3u8 (HLS) URL, an .mp4 / .webm URL,
 *  or a YouTube / Vimeo link. Leave it "" and the card shows "Coming soon".
 * ─────────────────────────────────────────────────────────────────────────
 */
window.KENISHA_PORTFOLIO = {
  name: "Kenisha Khatri",
  role: "Video Editor",

  /* The `xxxxxxxx` in https://customer-xxxxxxxx.cloudflarestream.com
     (Cloudflare dashboard → Stream → any video → Embed / Share). */
  cloudflareCustomerCode: "",

  /* Shown in the hero. Optional fields can be left "" — empty ones are hidden. */
  intro: "Podcast edits in Hindi, English and Tamil, a Breaking Bad intro remake, and a multilingual voice-agent product demo.",
  location: "",
  email: "",
  /* e.g. { label: "Instagram", url: "https://instagram.com/…" } */
  socials: [],

  about: {
    bio: "Video editor cutting podcasts, remakes and product films across Hindi, English and Tamil.",
    edits: ["Podcasts", "Remakes", "Product demos"],
    languages: ["Hindi", "English", "Tamil"],
    tools: []
  },

  /* The big hero video — Kenisha's intro. */
  showreel: {
    title: "Meet Kenisha — Intro",
    video: "",
    duration: ""
  },

  /* orientation: "landscape" (16:9) or "portrait" (9:16). role / year / duration optional. */
  projects: [
    { id: "01", title: "Podcast Edit — Hindi",   category: "Podcast",      language: "Hindi",   orientation: "landscape", video: "", note: "Full podcast episode edit in Hindi." },
    { id: "02", title: "Podcast Edit — English", category: "Podcast",      language: "English", orientation: "landscape", video: "", note: "Full podcast episode edit in English." },
    { id: "03", title: "Podcast Edit — Tamil",   category: "Podcast",      language: "Tamil",   orientation: "landscape", video: "", note: "Full podcast episode edit in Tamil." },
    { id: "04", title: "Breaking Bad — Intro Remake", category: "Remake",  language: "",        orientation: "landscape", video: "", note: "A remake of the Breaking Bad title sequence." },
    { id: "05", title: "Multilingual Voice Agent — Product Demo", category: "Product Demo", language: "Multilingual", orientation: "landscape", video: "", note: "SaaS demo video for a multilingual voice agent." }
  ]
};
