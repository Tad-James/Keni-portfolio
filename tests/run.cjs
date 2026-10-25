/*
 * End-to-end checks for the portfolio. Dev-only — nothing here ships to Vercel.
 *
 *   cd tests && npm install && npx playwright install chromium && node run.cjs
 *
 * Needs ffmpeg on PATH. It generates a real 2-rung adaptive HLS stream, mocks the
 * Cloudflare Stream endpoints with it, then drives the site at phone → desktop sizes.
 */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DIST = path.join(__dirname, "..", "dist");
const FX = path.join(__dirname, ".fixtures");
const SHOTS = path.join(__dirname, "screens");
const CF_HOST = "https://customer-test.cloudflarestream.com";
const IDS = { reel: "a".repeat(32), p1: "b".repeat(32), broken: "c".repeat(32) };
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".m3u8": "application/vnd.apple.mpegurl", ".ts": "video/mp2t", ".mp4": "video/mp4", ".txt": "text/plain" };

let failures = 0;
function check(ok, label, extra) {
  console.log((ok ? "  ✓ " : "  ✗ ") + label + (extra ? "  → " + extra : ""));
  if (!ok) failures += 1;
}

function makeFixtures() {
  if (fs.existsSync(path.join(FX, "master.m3u8"))) return;
  fs.mkdirSync(FX, { recursive: true });
  const run = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { cwd: FX });
  run(["-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=30", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000", "-t", "8",
    "-filter_complex", "[0:v]split=2[a][b];[b]scale=640:360[bs]", "-map", "[a]", "-map", "1:a", "-map", "[bs]", "-map", "1:a",
    "-c:v", "libx264", "-preset", "veryfast", "-g", "60", "-keyint_min", "60", "-sc_threshold", "0", "-c:a", "aac",
    "-b:v:0", "2000k", "-b:v:1", "600k", "-var_stream_map", "v:0,a:0 v:1,a:1",
    "-f", "hls", "-hls_time", "2", "-hls_playlist_type", "vod", "-master_pl_name", "master.m3u8", "-hls_segment_filename", "v%v_%03d.ts", "v%v.m3u8"]);
  run(["-f", "lavfi", "-i", "testsrc2=size=640x360:rate=30", "-f", "lavfi", "-i", "sine=frequency=330", "-t", "5", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", "clip.mp4"]);
  run(["-f", "lavfi", "-i", "testsrc2=size=1280x720", "-frames:v", "1", "thumb.jpg"]);
}

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, "http://x");
      let file = decodeURIComponent(url.pathname);
      const base = file.startsWith("/__fx/") ? FX : DIST;
      if (base === FX) file = file.slice(5);
      if (file.endsWith("/")) file += "index.html";
      let full = path.join(base, file);
      if (!full.startsWith(base)) { res.writeHead(403).end(); return; }
      if (!fs.existsSync(full) && base === DIST && !path.extname(file)) full = path.join(DIST, file + ".html");
      if (!fs.existsSync(full)) { res.writeHead(404, { "content-type": "text/plain" }).end("not found"); return; }
      const stat = fs.statSync(full);
      const type = MIME[path.extname(full)] || "application/octet-stream";
      const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
      if (range) {
        const start = range[1] ? +range[1] : 0, end = range[2] ? +range[2] : stat.size - 1;
        res.writeHead(206, { "content-type": type, "accept-ranges": "bytes", "content-range": `bytes ${start}-${end}/${stat.size}`, "content-length": end - start + 1 });
        fs.createReadStream(full, { start, end }).pipe(res);
      } else {
        res.writeHead(200, { "content-type": type, "content-length": stat.size, "accept-ranges": "bytes" });
        fs.createReadStream(full).pipe(res);
      }
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, origin: "http://127.0.0.1:" + server.address().port }));
  });
}

function mockContent(origin) {
  const src = fs.readFileSync(path.join(DIST, "site-content.js"), "utf8");
  const sandbox = { window: {} };
  require("vm").runInNewContext(src, sandbox);
  const data = sandbox.window.KENISHA_PORTFOLIO;
  data.cloudflareCustomerCode = "test";
  data.email = "hello@example.com";
  data.location = "Mumbai, India";
  data.socials = [{ label: "Instagram", url: "https://instagram.com/example", handle: "@example" }];
  data.about.tools = ["Premiere Pro", "DaVinci Resolve"];
  data.showreel.video = IDS.reel;
  data.showreel.duration = "00:45";
  data.projects[0].video = IDS.p1;
  data.projects[0].duration = "42:10";
  data.projects[0].role = "Editor";
  data.projects[0].year = "2026";
  data.projects[1].video = origin + "/__fx/master.m3u8";
  data.projects[2].video = origin + "/__fx/clip.mp4";
  data.projects[3].video = "";
  data.projects[4].video = IDS.broken;
  return "window.KENISHA_PORTFOLIO = " + JSON.stringify(data) + ";";
}

async function newPage(browser, origin, viewport, mock) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 800, hasTouch: viewport.width < 800, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) problems.push("console: " + m.text()); });
  page.on("requestfailed", (r) => { if (!/ERR_ABORTED/.test(r.failure().errorText)) problems.push("requestfailed: " + r.url()); });
  if (mock) {
    const content = mockContent(origin);
    await page.route("**/site-content.js", (route) => route.fulfill({ contentType: "text/javascript", body: content }));
    await page.route(CF_HOST + "/**", async (route) => {
      const url = new URL(route.request().url());
      const headers = { "access-control-allow-origin": "*" };
      if (url.pathname.includes(IDS.broken)) return route.fulfill({ status: 404, headers, body: "nope" });
      if (url.pathname.includes("/thumbnails/")) return route.fulfill({ headers, contentType: "image/jpeg", body: fs.readFileSync(path.join(FX, "thumb.jpg")) });
      const name = url.pathname.split("/").pop().replace("video.m3u8", "master.m3u8");
      const file = path.join(FX, name);
      if (!fs.existsSync(file)) return route.fulfill({ status: 404, headers, body: "" });
      return route.fulfill({ headers, contentType: MIME[path.extname(file)], body: fs.readFileSync(file) });
    });
  }
  return { page, context, problems };
}

const VIEWPORTS = [
  { name: "phone-360", width: 360, height: 740 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "phone-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "landscape-phone", width: 740, height: 360 }
];

async function layoutChecks(page, label) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const tiny = [];
    document.querySelectorAll("body *").forEach((node) => {
      if (!node.childNodes.length) return;
      const hasText = Array.from(node.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) return;
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (parseFloat(style.fontSize) < 11) tiny.push(node.className || node.tagName);
    });
    const clipped = [];
    document.querySelectorAll(".project-title, .project-subtitle, .hero-intro, .contact-value, .dialog-meta, h1, h2").forEach((n) => {
      if (n.scrollWidth > n.clientWidth + 1 && getComputedStyle(n).overflow !== "visible") clipped.push(n.className || n.tagName);
    });
    return { scrollW: doc.scrollWidth, clientW: doc.clientWidth, tiny: [...new Set(tiny)].slice(0, 8), clipped };
  });
  check(result.scrollW <= result.clientW, `${label}: no horizontal scroll`, `${result.scrollW} vs ${result.clientW}`);
  check(result.tiny.length === 0, `${label}: no text under 11px`, result.tiny.join(", "));
  check(result.clipped.length === 0, `${label}: no clipped text`, result.clipped.join(", "));
}

async function playsOk(page) {
  return page.waitForFunction(() => {
    const v = document.querySelector("#dialog-media video");
    return v && !v.paused && v.currentTime > 0.8 && v.videoWidth > 0;
  }, null, { timeout: 20000 }).then(() => true, () => false);
}

(async () => {
  makeFixtures();
  fs.mkdirSync(SHOTS, { recursive: true });
  const { server, origin } = await serve();
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

  console.log("\n▸ Layout at every viewport — shipped content (videos not uploaded yet)");
  for (const vp of VIEWPORTS) {
    const { page, context, problems } = await newPage(browser, origin, vp, false);
    await page.goto(origin + "/", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await layoutChecks(page, vp.name);
    check(problems.length === 0, `${vp.name}: no console/network errors`, problems.join(" | "));
    await page.screenshot({ path: path.join(SHOTS, `shipped-${vp.name}.png`), fullPage: true });
    await context.close();
  }

  console.log("\n▸ Layout at every viewport — with videos wired (mocked Cloudflare)");
  for (const vp of VIEWPORTS) {
    const { page, context, problems } = await newPage(browser, origin, vp, true);
    await page.goto(origin + "/", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector(".hero-reel.has-poster"));
    await page.waitForTimeout(300);
    await layoutChecks(page, vp.name);
    check(problems.length === 0, `${vp.name}: no console/network errors`, problems.join(" | "));
    await page.screenshot({ path: path.join(SHOTS, `mock-${vp.name}.png`), fullPage: true });
    await context.close();
  }

  console.log("\n▸ Playback & interaction — desktop");
  {
    const { page, context, problems } = await newPage(browser, origin, { width: 1280, height: 800 }, true);
    await page.goto(origin + "/", { waitUntil: "load" });

    check(await page.locator(".project-card").count() === 5, "5 project cards render");
    check(await page.locator(".filter-chip").count() === 4, "filter chips built from categories (All + 3)");
    check((await page.locator("#header-contact").getAttribute("href")) === "mailto:hello@example.com", "header CTA uses mailto when email set");
    check((await page.locator(".contact-value").count()) === 2, "contact shows email + Instagram");

    // intent warm-up: hovering a card should pull in hls.js before any click
    check(await page.evaluate(() => !window.Hls), "hls.js is NOT loaded on first paint");
    await page.locator(".project-card").first().hover();
    check(await page.waitForFunction(() => !!window.Hls, null, { timeout: 4000 }).then(() => true, () => false), "hover warms the player (hls.js loaded)");

    // 1) Cloudflare Stream id → adaptive HLS via hls.js
    const t0 = Date.now();
    await page.locator(".project-card").first().click();
    check(await page.locator("#media-dialog[open]").count() === 1, "click opens the player dialog");
    check(await playsOk(page), "Cloudflare-ID video plays (HLS)", `${Date.now() - t0}ms to first playing frame`);
    const levels = await page.evaluate(() => { const v = document.querySelector("#dialog-media video"); return { src: v.currentSrc || v.src, poster: v.poster }; });
    check(/blob:/.test(levels.src), "served through hls.js/MSE (blob source)", levels.src.slice(0, 40));
    check(/thumbnails\/thumbnail\.jpg/.test(levels.poster), "poster comes from Stream thumbnail endpoint");
    await page.screenshot({ path: path.join(SHOTS, "player-desktop.png") });
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("#media-dialog[open]"));
    check(await page.waitForFunction(() => !document.querySelector("#dialog-media video"), null, { timeout: 2000 }).then(() => true, () => false), "closing tears the video down");
    check(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains("project-card")), "focus returns to the card");

    // 2) same-origin .m3u8
    await page.locator(".project-card").nth(1).click();
    check(await playsOk(page), "direct .m3u8 URL plays");
    await page.locator(".dialog-close").click();

    // 3) mp4
    await page.locator(".project-card").nth(2).click();
    check(await playsOk(page), "direct .mp4 URL plays");
    await page.mouse.click(5, 5); // backdrop light-dismiss
    await page.waitForFunction(() => !document.querySelector("#media-dialog[open]"), null, { timeout: 3000 }).then(() => check(true, "clicking the backdrop closes the player"), () => check(false, "clicking the backdrop closes the player"));

    // 4) no video yet
    await page.locator(".project-card").nth(3).click();
    check(/COMING SOON/.test(await page.locator(".dialog-slot").innerText()), "card without a video shows 'Coming soon'");
    await page.keyboard.press("Escape");

    // 5) broken stream → friendly error + retry
    await page.locator(".project-card").nth(4).click();
    check(await page.locator(".player-status .player-retry").waitFor({ timeout: 20000 }).then(() => true, () => false), "failed stream shows an error with 'Try again'");
    await page.keyboard.press("Escape");

    // 6) hero intro button
    await page.locator("#hero-reel").click();
    check(await playsOk(page), "hero intro (Cloudflare ID) plays");
    await page.keyboard.press("Escape");

    // 7) filters
    await page.locator('.filter-chip[data-filter="Podcast"]').click();
    check(await page.locator(".project-card").count() === 3, "Podcast filter shows 3 films");
    check((await page.locator("#project-count").innerText()) === "03", "film counter updates");
    await page.locator('.filter-chip[data-filter="All"]').click();
    check(await page.locator(".project-card").count() === 5, "All filter restores 5");
    check(problems.filter((p) => !/cccccc/.test(p)).length === 0, "no unexpected console errors", problems.join(" | "));
    await context.close();
  }

  console.log("\n▸ Mobile interaction");
  {
    const { page, context } = await newPage(browser, origin, { width: 390, height: 844 }, true);
    await page.goto(origin + "/", { waitUntil: "load" });
    await page.locator("#menu-toggle").tap();
    check(await page.locator("#main-nav.is-open").count() === 1, "hamburger opens the menu");
    await page.locator('#main-nav a[href="#about"]').tap();
    check(await page.locator("#main-nav.is-open").count() === 0, "choosing a link closes the menu");
    await page.locator(".project-card").first().scrollIntoViewIfNeeded();
    await page.locator(".project-card").first().tap();
    check(await playsOk(page), "tap-to-play works on a phone viewport");
    const box = await page.locator("#dialog-media").boundingBox();
    check(box && box.width <= 390 && box.height > 150, "player fits the phone screen", JSON.stringify(box));
    await page.screenshot({ path: path.join(SHOTS, "player-phone.png") });
    await context.close();
  }

  await browser.close();
  server.close();
  console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed");
  process.exit(failures ? 1 : 0);
})().catch((error) => { console.error(error); process.exit(1); });
