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
 *  FREE OPTIONS (paste into `video`):
 *    YouTube (unlimited, free):  "https://youtu.be/XXXXXXXXXXX"   (set the video to Unlisted)
 *    Mux (free plan, 10 videos):  "mux:PLAYBACK_ID"   ← currently used
 *
 *  `video` also accepts: a full .m3u8 (HLS) URL, an .mp4 / .webm URL,
 *  or a Vimeo link. Leave it "" and the card shows "Coming soon".
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
  /* Shown in Contact and the footer. `handle` is the text displayed. */
  socials: [
    { label: "Instagram", handle: "@kenny_editzvideos", url: "https://www.instagram.com/kenny_editzvideos/" },
    { label: "LinkedIn",  handle: "kenisha-khatri",     url: "https://www.linkedin.com/in/kenisha-khatri-76055b388" }
  ],

  about: {
    bio: "Video editor cutting podcasts, remakes and product films across Hindi, English and Tamil.",
    edits: ["Podcasts", "Remakes", "Product demos"],
    languages: ["Hindi", "English", "Tamil"],
    tools: []
  },

  /* The big hero video — Kenisha's intro. */
  showreel: {
    title: "Meet Kenisha — Intro",
    video: "mux:wnpW9Y401OHnb01qivJzdOsf89hyxspouUO5obbbzxWBM",
    duration: ""
  },

  /* orientation: "landscape" (16:9) or "portrait" (9:16). role / year optional. */
  projects: [
    { id: "01", title: "Podcast Edit — Hindi",   category: "Podcast",      language: "Hindi",   orientation: "portrait", duration: "00:46", video: "mux:v7Ovrcx9G1tObKLcoSgpwSpnKpQDffOrrgAm6Xm01TcA",             note: "Podcast clip edit in Hindi." },
    { id: "02", title: "Podcast Edit — English", category: "Podcast",      language: "English", orientation: "portrait", duration: "00:38", video: "mux:AHBS2k7pXjCrRjfmoGh3siio45fXI00qoo5OSUtK4D8g",             note: "Podcast clip edit in English." },
    { id: "03", title: "Podcast Edit — Tamil",   category: "Podcast",      language: "Tamil",   orientation: "portrait", duration: "00:43", video: "mux:P400014GnSe3gS5ddHlzrMA014vhdq02kirasQZ402tJzqAw",         note: "Podcast clip edit in Tamil." },
    { id: "04", title: "Breaking Bad — Intro Remake", category: "Remake",  language: "",        orientation: "portrait", duration: "00:25", video: "mux:68jPTtna0202btjf01EHTM5WJEXPa5sOAjPhcp00w527oeQ",         note: "A remake of the Breaking Bad title sequence." },
    { id: "05", title: "Multilingual Voice Agent — Product Demo", category: "Product Demo", language: "Multilingual", orientation: "portrait", duration: "01:07", video: "mux:3GS3G02yUyp8i01MX2mEa02UXbKZEqOv4rFGbzVTNGAcys", note: "SaaS demo video for a multilingual voice agent." }
  ]
};
