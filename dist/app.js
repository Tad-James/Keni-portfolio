(function () {
  "use strict";

  var data = window.KENISHA_PORTFOLIO || {};
  var HLS_SRC = "/vendor/hls-1.5.20.min.js";
  var CF_ID = /^[a-f0-9]{32}$/i;

  var grid = document.getElementById("project-grid");
  var count = document.getElementById("project-count");
  var filterBar = document.getElementById("filter-bar");
  var dialog = document.getElementById("media-dialog");
  var dialogMedia = document.getElementById("dialog-media");
  var dialogTitle = document.getElementById("dialog-title");
  var dialogCategory = document.getElementById("dialog-category");
  var dialogMeta = document.getElementById("dialog-meta");
  var dialogDescription = document.getElementById("dialog-description");
  var closeDialog = document.querySelector(".dialog-close");
  var lastFocused = null;

  /* ── tiny helpers ─────────────────────────────────────────────────── */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function clean(value) { return typeof value === "string" ? value.trim() : ""; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function allowedUrl(value) {
    value = clean(value);
    if (!value) return "";
    try {
      var url = new URL(value, window.location.href);
      if (url.protocol === "https:" || url.origin === window.location.origin) return url.href;
    } catch (error) {}
    return "";
  }

  /* ── media resolution: one `video` string → how to play it ───────── */
  function resolveMedia(spec, posterTime) {
    var raw = clean(spec);
    if (!raw) return null;

    if (CF_ID.test(raw)) {
      var code = clean(data.cloudflareCustomerCode);
      if (!code) {
        if (window.console) console.warn("Set cloudflareCustomerCode in site-content.js to play Cloudflare Stream videos.");
        return null;
      }
      var base = "https://customer-" + encodeURIComponent(code) + ".cloudflarestream.com/" + raw;
      return {
        kind: "hls",
        src: base + "/manifest/video.m3u8",
        origin: new URL(base).origin,
        poster: function (height) { return base + "/thumbnails/thumbnail.jpg?time=" + (posterTime || "2s") + "&height=" + height; }
      };
    }

    // Mux (free plan available): "mux:PLAYBACK_ID" or a stream.mux.com/….m3u8 link
    var mux = /^mux:([A-Za-z0-9]{10,})$/.exec(raw) || /^https:\/\/stream\.mux\.com\/([A-Za-z0-9]{10,})(?:\.m3u8)?(?:\?.*)?$/.exec(raw);
    if (mux) {
      var seconds = parseInt(posterTime, 10) || 2;
      return {
        kind: "hls",
        src: "https://stream.mux.com/" + mux[1] + ".m3u8",
        origin: "https://stream.mux.com",
        poster: function (height) { return "https://image.mux.com/" + mux[1] + "/thumbnail.jpg?time=" + seconds + "&height=" + height; }
      };
    }

    var safe = allowedUrl(raw);
    if (!safe) return null;
    var parsed = new URL(safe);
    var host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    var id = "";

    if (host === "youtu.be") {
      id = parsed.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      id = parsed.searchParams.get("v") || (parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/]+)/) || [])[1] || "";
    }
    if (id && /^[\w-]{6,20}$/.test(id)) {
      return {
        kind: "iframe",
        origin: "https://www.youtube-nocookie.com",
        src: "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1",
        poster: function () { return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }
      };
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      var vid = (parsed.pathname.match(/(\d{6,})/) || [])[1];
      if (vid) {
        var hash = parsed.searchParams.get("h") || (parsed.pathname.match(/\/\d+\/([a-f0-9]+)/) || [])[1];
        return { kind: "iframe", origin: "https://player.vimeo.com", src: "https://player.vimeo.com/video/" + vid + "?autoplay=1&playsinline=1" + (hash ? "&h=" + hash : ""), poster: function () { return ""; } };
      }
    }
    if (/\.m3u8$/i.test(parsed.pathname)) return { kind: "hls", src: safe, origin: parsed.origin, poster: function () { return ""; } };
    if (/\.(mp4|webm|mov|m4v)$/i.test(parsed.pathname)) return { kind: "file", src: safe, origin: parsed.origin, poster: function () { return ""; } };
    return null;
  }

  function posterFor(project, media, height) {
    var own = allowedUrl(project.poster);
    if (own) return own;
    return media ? media.poster(height) : "";
  }

  /* ── adaptive streaming engine (hls.js loads only when needed) ───── */
  var hlsPromise = null;
  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = HLS_SRC;
        script.async = true;
        script.onload = function () { resolve(window.Hls); };
        script.onerror = function () { hlsPromise = null; reject(new Error("hls.js failed to load")); };
        document.head.appendChild(script);
      });
    }
    return hlsPromise;
  }
  var probe = document.createElement("video");
  var nativeHls = !!probe.canPlayType("application/vnd.apple.mpegurl");
  var safariLike = /^((?!chrome|chromium|android|edg|firefox|crios).)*safari/i.test(navigator.userAgent) || /iPhone|iPad|iPod/.test(navigator.userAgent);
  // Prefer the platform's own HLS on Apple devices (battery, AirPlay); hls.js everywhere else.
  function preferNative() { return nativeHls && (safariLike || !window.MediaSource); }

  /* Warm the connection + engine when a viewer shows intent, so click → first frame is fast. */
  var warmed = {};
  function warm(media) {
    if (!media || warmed[media.src]) return;
    var conn = navigator.connection;
    if (conn && conn.saveData) return;
    warmed[media.src] = true;
    if (media.origin && !warmed[media.origin]) {
      warmed[media.origin] = true;
      var link = document.createElement("link");
      link.rel = "preconnect";
      link.href = media.origin;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
    if (media.kind === "iframe") return; // embeds only need the connection warmed
    if (media.kind === "hls") {
      if (!preferNative()) loadHls().catch(function () {});
      try { fetch(media.src, { mode: "cors", credentials: "omit" }).catch(function () {}); } catch (error) {}
    }
  }

  /* ── player ───────────────────────────────────────────────────────── */
  var session = 0;
  var activeHls = null;

  function teardownPlayer() {
    session += 1;
    if (activeHls) { try { activeHls.destroy(); } catch (error) {} activeHls = null; }
    var video = dialogMedia.querySelector("video");
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    dialogMedia.replaceChildren();
  }

  function showStatus(message, retry) {
    var old = dialogMedia.querySelector(".player-status");
    if (old) old.remove();
    var box = el("div", "player-status");
    box.setAttribute("role", "alert");
    box.appendChild(el("strong", "", message));
    if (retry) {
      var button = el("button", "player-retry", "Try again");
      button.type = "button";
      button.addEventListener("click", retry);
      box.appendChild(button);
    }
    dialogMedia.appendChild(box);
  }

  function mountVideo(media, posterUrl) {
    var mine = ++session;
    dialogMedia.replaceChildren();

    if (media.kind === "iframe") {
      var frame = el("iframe");
      frame.src = media.src;
      frame.title = dialogTitle.textContent || "Video";
      frame.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      dialogMedia.appendChild(frame);
      return;
    }

    var video = el("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("controlslist", "nodownload");
    if (posterUrl) video.poster = posterUrl;
    var spinner = el("div", "player-spinner");
    spinner.setAttribute("role", "status");
    spinner.setAttribute("aria-label", "Loading video");
    function busy(on) { spinner.hidden = !on; }
    // Trust the video's real shape over the configured orientation (fixes layout for any upload).
    video.addEventListener("loadedmetadata", function () {
      if (video.videoWidth && video.videoHeight) dialogMedia.classList.toggle("is-portrait", video.videoHeight > video.videoWidth * 1.05);
    });
    video.addEventListener("waiting", function () { busy(true); });
    video.addEventListener("playing", function () { busy(false); });
    video.addEventListener("canplay", function () { busy(false); });
    video.addEventListener("pause", function () { busy(false); });
    dialogMedia.appendChild(video);
    dialogMedia.appendChild(spinner);

    function retry() { mountVideo(media, posterUrl); }
    function fail() { busy(false); showStatus("This video couldn’t be loaded.", retry); }
    function start() { var p = video.play(); if (p && p.catch) p.catch(function () { busy(false); }); }

    if (media.kind === "file" || (media.kind === "hls" && preferNative())) {
      video.addEventListener("error", fail);
      video.src = media.src;
      start();
      return;
    }

    loadHls().then(function (Hls) {
      if (mine !== session) return;
      if (!Hls || !Hls.isSupported()) {
        if (nativeHls) { video.addEventListener("error", fail); video.src = media.src; start(); } else fail();
        return;
      }
      var hls = new Hls({ capLevelToPlayerSize: true, startFragPrefetch: true, maxBufferLength: 30, maxMaxBufferLength: 60, abrEwmaDefaultEstimate: 3e6 });
      activeHls = hls;
      var netTries = 0;
      var mediaTries = 0;
      hls.on(Hls.Events.MANIFEST_PARSED, start);
      hls.on(Hls.Events.ERROR, function (event, info) {
        if (!info.fatal || mine !== session) return;
        // Flaky connections: retry a couple of times (re-requesting the playlist if that is what failed).
        if (info.type === Hls.ErrorTypes.NETWORK_ERROR && netTries < 2) {
          netTries += 1;
          setTimeout(function () {
            if (mine !== session) return;
            if (/manifest|level/i.test(info.details)) hls.loadSource(media.src); else hls.startLoad();
          }, 800 * netTries);
          return;
        }
        if (info.type === Hls.ErrorTypes.MEDIA_ERROR && mediaTries < 2) { mediaTries += 1; hls.recoverMediaError(); return; }
        hls.destroy();
        if (activeHls === hls) activeHls = null;
        fail();
      });
      hls.loadSource(media.src);
      hls.attachMedia(video);
    }).catch(function () { if (mine === session) fail(); });
  }

  function openPlayer(item, trigger) {
    lastFocused = trigger || document.activeElement;
    teardownPlayer();
    dialogTitle.textContent = item.title || "Video";
    dialogCategory.textContent = item.category || "";
    dialogMeta.textContent = item.meta || "";
    dialogDescription.textContent = item.description || "";
    dialogDescription.hidden = !item.description;
    dialogMedia.classList.toggle("is-portrait", item.orientation === "portrait");
    if (item.media) {
      mountVideo(item.media, posterFor(item.project || {}, item.media, 720));
    } else {
      var slot = el("div", "dialog-slot");
      slot.appendChild(el("strong", "", "COMING SOON"));
      slot.appendChild(el("span", "", "This film is being uploaded. Check back shortly."));
      dialogMedia.appendChild(slot);
    }
    dialog.showModal();
    closeDialog.focus();
  }

  /* ── work grid ────────────────────────────────────────────────────── */
  var projects = (Array.isArray(data.projects) ? data.projects : []).map(function (project, index) {
    project = project || {};
    return { raw: project, media: resolveMedia(project.video, project.posterTime), index: index };
  });

  function formatLabel(project) {
    return project.orientation === "portrait" ? "Vertical · 9:16" : "Landscape · 16:9";
  }

  function makeArtwork(entry) {
    var project = entry.raw;
    var art = el("div", "project-art art art-0" + ((entry.index % 6) + 1));
    art.appendChild(el("span", "art-shape shape-a"));
    art.appendChild(el("span", "art-shape shape-b"));
    var posterUrl = posterFor(project, entry.media, 540);
    if (posterUrl) {
      var image = el("img");
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", function () { image.remove(); });
      image.src = posterUrl;
      art.appendChild(image);
    }
    art.appendChild(el("span", "art-label", clean(project.language) ? project.language.toUpperCase() : (project.category || "").toUpperCase()));
    art.appendChild(el("span", "art-index", project.id || pad(entry.index + 1)));
    var caption = el("span", "poster-caption");
    caption.appendChild(el("span", "", "KK — " + (project.id || pad(entry.index + 1))));
    caption.appendChild(el("strong", "", entry.media ? clean(project.duration) : "COMING SOON"));
    art.appendChild(caption);
    var overlay = el("span", "art-overlay");
    overlay.appendChild(el("span", "", "▶"));
    art.appendChild(overlay);
    return art;
  }

  function makeCard(entry, spanClass) {
    var project = entry.raw;
    var button = el("button", "project-card " + spanClass + (project.orientation === "portrait" ? " is-portrait" : ""));
    button.type = "button";
    button.setAttribute("aria-label", (entry.media ? "Play: " : "Coming soon: ") + (project.title || "Untitled"));
    button.appendChild(makeArtwork(entry));
    var info = el("span", "project-info");
    var left = el("span", "");
    left.appendChild(el("span", "project-title", project.title || "Untitled"));
    left.appendChild(el("span", "project-subtitle", [project.category, project.language, formatLabel(project)].filter(Boolean).join(" / ")));
    info.appendChild(left);
    info.appendChild(el("span", "project-index", pad(entry.index + 1)));
    button.appendChild(info);
    var tagA = clean(project.role);
    var tagB = clean(project.year); // duration already shows on the poster
    if (tagA || tagB) {
      var tags = el("span", "project-tags");
      tags.appendChild(el("span", "", tagA));
      tags.appendChild(el("span", "", tagB));
      button.appendChild(tags);
    }
    var intent = function () { warm(entry.media); };
    button.addEventListener("pointerenter", intent);
    button.addEventListener("focus", intent);
    button.addEventListener("touchstart", intent, { passive: true });
    button.addEventListener("click", function () {
      openPlayer({
        title: project.title, category: (project.category || "").toUpperCase(),
        meta: [project.language, project.role, formatLabel(project), project.year].filter(Boolean).join(" / "),
        description: clean(project.note), media: entry.media, orientation: project.orientation, project: project
      }, button);
    });
    return button;
  }

  function renderProjects(category) {
    grid.replaceChildren();
    var visible = projects.filter(function (entry) { return category === "All" || entry.raw.category === category; });
    // All-vertical work gets a "reels wall" (tall 9:16 cards side by side); mixed/landscape work uses the 3-up grid.
    var wall = visible.length > 0 && visible.every(function (entry) { return entry.raw.orientation === "portrait"; });
    grid.classList.toggle("is-portrait-wall", wall);
    var tail = visible.length % 3;
    visible.forEach(function (entry, i) {
      var inTail = !wall && tail && i >= visible.length - tail && entry.raw.orientation !== "portrait";
      grid.appendChild(makeCard(entry, inTail ? (tail === 1 ? "span-12" : "span-6") : "span-4"));
    });
    count.textContent = pad(visible.length);
    if (!visible.length) grid.appendChild(el("p", "empty-state", "No films in this category yet."));
  }

  function renderFilters() {
    var categories = [];
    projects.forEach(function (entry) { var c = entry.raw.category; if (c && categories.indexOf(c) < 0) categories.push(c); });
    if (categories.length < 2) { filterBar.hidden = true; return; }
    var chips = [];
    ["All"].concat(categories).forEach(function (name, i) {
      var chip = el("button", "filter-chip" + (i === 0 ? " is-active" : ""));
      chip.type = "button";
      chip.dataset.filter = name;
      chip.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      chip.appendChild(document.createTextNode(i === 0 ? "All work" : name));
      if (i === 0) chip.appendChild(el("sup", "", pad(projects.length)));
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        renderProjects(name);
      });
      chips.push(chip);
      filterBar.appendChild(chip);
    });
  }

  /* ── hero / about / contact ───────────────────────────────────────── */
  var reel = data.showreel || {};
  var reelMedia = resolveMedia(reel.video, reel.posterTime);
  var heroReel = document.getElementById("hero-reel");

  function setupHero() {
    var posterUrl = allowedUrl(reel.poster) || (reelMedia ? reelMedia.poster(720) : "");
    if (posterUrl) {
      var image = el("img", "hero-reel-poster");
      image.alt = "";
      image.decoding = "async";
      image.fetchPriority = "high";
      image.addEventListener("load", function () { heroReel.classList.add("has-poster"); });
      image.addEventListener("error", function () { image.remove(); });
      image.src = posterUrl;
      heroReel.insertBefore(image, heroReel.firstChild);
    }
    if (!reelMedia) document.getElementById("reel-prompt-sub").textContent = "COMING SOON";
    if (clean(reel.duration)) document.getElementById("reel-duration").textContent = reel.duration;
    var intro = clean(data.intro);
    if (intro) document.getElementById("hero-intro").textContent = intro;
    var foot = document.getElementById("hero-foot");
    foot.replaceChildren();
    function stat(label, value) {
      if (!clean(value)) return;
      var span = el("span");
      span.appendChild(el("b", "", label));
      span.appendChild(document.createTextNode(" " + value));
      foot.appendChild(span);
    }
    stat("BASE", data.location);
    var langs = (data.about && data.about.languages) || [];
    stat("EDITS IN", langs.join(" · "));
    foot.hidden = !foot.children.length;

    document.querySelectorAll("[data-open-reel]").forEach(function (button) {
      var intent = function () { warm(reelMedia); };
      button.addEventListener("pointerenter", intent);
      button.addEventListener("focus", intent);
      button.addEventListener("touchstart", intent, { passive: true });
      button.addEventListener("click", function () {
        openPlayer({
          title: reel.title || "Intro", category: "INTRO", meta: clean(reel.duration),
          description: clean(reel.note), media: reelMedia, orientation: reel.orientation, project: reel
        }, button);
      });
    });
  }

  function setupAbout() {
    var about = data.about || {};
    var bio = document.getElementById("about-bio");
    bio.textContent = clean(about.bio);
    bio.hidden = !bio.textContent;
    var list = document.getElementById("detail-list");
    [["WHAT I EDIT", (about.edits || []).join(" · ")], ["LANGUAGES", (about.languages || []).join(" · ")],
     ["TOOLS", (about.tools || []).join(" · ")], ["BASED IN", clean(data.location)]].forEach(function (row) {
      if (!row[1]) return;
      var group = el("div");
      group.appendChild(el("dt", "", row[0]));
      group.appendChild(el("dd", "", row[1]));
      list.appendChild(group);
    });
    list.hidden = !list.children.length;
  }

  function setupContact() {
    var rows = document.getElementById("contact-rows");
    var footerSocial = document.getElementById("footer-social");
    var email = clean(data.email);
    // Each row is one big tappable link: LABEL ........ value ↗
    function row(label, text, href, external) {
      var line = el("a", "contact-row");
      line.href = href;
      if (external) { line.target = "_blank"; line.rel = "noopener noreferrer"; }
      line.setAttribute("aria-label", label + ": " + text + (external ? " (opens in a new tab)" : ""));
      line.appendChild(el("span", "contact-label", label));
      line.appendChild(el("span", "contact-value", text));
      rows.appendChild(line);
    }
    var names = [];
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      row("EMAIL", email, "mailto:" + email, false);
      document.getElementById("header-contact").href = "mailto:" + email;
    }
    (Array.isArray(data.socials) ? data.socials : []).forEach(function (social) {
      var url = allowedUrl(social && social.url);
      var label = clean(social && social.label);
      if (!url || !label) return;
      row(label.toUpperCase(), clean(social.handle) || label, url, true);
      names.push(label);
      var link = el("a", "", label);
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      footerSocial.appendChild(link);
    });
    footerSocial.hidden = !footerSocial.children.length;
    var note = document.getElementById("contact-note");
    if (!rows.children.length) note.textContent = "Contact details are coming soon.";
    else if (!email && names.length) note.textContent = "For projects and collaborations, message on " + names.join(" or ") + ".";
  }

  /* ── dialog behaviour ─────────────────────────────────────────────── */
  closeDialog.addEventListener("click", function () { dialog.close(); });
  // Fallback for browsers without <dialog closedby> (Safari): close on backdrop click.
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    dialog.addEventListener("click", function (event) {
      if (event.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      var inside = rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
                   rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
      if (!inside) dialog.close();
    });
  }
  dialog.addEventListener("close", function () {
    teardownPlayer();
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  });

  /* ── mobile navigation ────────────────────────────────────────────── */
  var menuToggle = document.getElementById("menu-toggle");
  var mainNav = document.getElementById("main-nav");
  function setMenu(open) {
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mainNav.classList.toggle("is-open", open);
  }
  menuToggle.addEventListener("click", function () { setMenu(menuToggle.getAttribute("aria-expanded") !== "true"); });
  mainNav.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape" && mainNav.classList.contains("is-open")) { setMenu(false); menuToggle.focus(); } });
  document.addEventListener("click", function (event) {
    if (mainNav.classList.contains("is-open") && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
  });

  /* ── boot ─────────────────────────────────────────────────────────── */
  document.getElementById("year").textContent = new Date().getFullYear();
  setupHero();
  setupAbout();
  setupContact();
  renderFilters();
  renderProjects("All");
})();
