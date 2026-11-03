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
  intro: "Podcast edits in Hindi, English and Tamil, real estate reels, and a multilingual voice-agent product demo.",
  location: "",
  email: "kenishakhatriproffesional@gmail.com",
  /* Shown in Contact as a tap-to-call row. Write it the way you want it displayed. */
  phone: "+91 86082 30300",
  /* Shown in Contact and the footer. `handle` is the text displayed. */
  socials: [
    { label: "Instagram", handle: "@kenny_editzvideos", url: "https://www.instagram.com/kenny_editzvideos/" },
    { label: "LinkedIn",  handle: "kenisha-khatri",     url: "https://www.linkedin.com/in/kenisha-khatri-76055b388" }
  ],

  about: {
    bio: "Video editor cutting podcasts, real estate reels and product films across Hindi, English and Tamil.",
    edits: ["Podcasts", "Real estate", "Product demos"],
    languages: ["Hindi", "English", "Tamil"],
    tools: []
  },

  /* The big hero video — Kenisha's intro. */
  showreel: {
    title: "Meet Kenisha — Intro",
    video: "mux:wnpW9Y401OHnb01qivJzdOsf89hyxspouUO5obbbzxWBM",
    duration: ""
  },

  /* orientation: "landscape" (16:9) or "portrait" (9:16). role / year optional.
     category decides the filter chips: "Podcast", "Real Estate", "Product Demo".
     To add a film, copy a line, give it the next id and paste its Mux playback ID. */
  projects: [
    { id: "01", title: "Podcast Edit — Hindi",   category: "Podcast",      language: "Hindi",   orientation: "portrait", duration: "00:46", video: "mux:v7Ovrcx9G1tObKLcoSgpwSpnKpQDffOrrgAm6Xm01TcA",             note: "Podcast clip edit in Hindi." },
    { id: "02", title: "Podcast Edit — English", category: "Podcast",      language: "English", orientation: "portrait", duration: "00:38", video: "mux:AHBS2k7pXjCrRjfmoGh3siio45fXI00qoo5OSUtK4D8g",             note: "Podcast clip edit in English." },
    { id: "03", title: "Podcast Edit — Tamil",   category: "Podcast",      language: "Tamil",   orientation: "portrait", duration: "00:43", video: "mux:P400014GnSe3gS5ddHlzrMA014vhdq02kirasQZ402tJzqAw",         note: "Podcast clip edit in Tamil." },
    { id: "04", title: "Podcast Edit — 04",     category: "Podcast",      language: "",        orientation: "portrait", duration: "",      video: "mux:02uwHBJ78Oytkp2OwbwTHQfjNewsaHrXeXQizSZLojYI",             note: "Podcast clip edit." },
    { id: "05", title: "Podcast Edit — 05",     category: "Podcast",      language: "",        orientation: "portrait", duration: "",      video: "mux:01hdReJEBBTolt5OEvd1hF02ClTWdtuC7l24aA3LpdINM",             note: "Podcast clip edit." },
    { id: "06", title: "Podcast Edit — 06",     category: "Podcast",      language: "",        orientation: "portrait", duration: "",      video: "mux:YV7oi148NcGXEyCAropLX1ADgiKKtB801f2jTk7IARpw",              note: "Podcast clip edit." },
    { id: "07", title: "Podcast Edit — 07",     category: "Podcast",      language: "",        orientation: "portrait", duration: "",      video: "mux:y015vPvUZ01300lCcUDV5z2BH3d02N9NXB3KHuhbabhMa34",           note: "Podcast clip edit." },
    { id: "08", title: "Multilingual Voice Agent — Product Demo", category: "Product Demo", language: "Multilingual", orientation: "portrait", duration: "01:07", video: "mux:3GS3G02yUyp8i01MX2mEa02UXbKZEqOv4rFGbzVTNGAcys", note: "SaaS demo video for a multilingual voice agent." },
    { id: "09", title: "Real Estate Reel — 01",  category: "Real Estate",  language: "",        orientation: "portrait", duration: "",      video: "mux:qP1yezBreFFbvU1QvQNGwlySsfM01eT9r6mxF5rxceQQ",             note: "Real estate property reel." },
    { id: "10", title: "Real Estate Reel — 02",  category: "Real Estate",  language: "",        orientation: "portrait", duration: "",      video: "mux:AN3TPay00WS01yrCiwGO8Pg2DWM1002Bch5kP3q00gN02Dag",          note: "Real estate property reel." }
  ],

  /* ─────────────────────────────────────────────────────────────────────
   *  PRICING — monthly reel packages. Everything in the Pricing section
   *  comes from here. Prices are in rupees.
   *  Leave `pricing` out entirely and the section (and its nav link) hide.
   *  A feature can be a plain string, or { lead: "…" } for a bold lead-in.
   * ───────────────────────────────────────────────────────────────────── */
  pricing: {
    lede: "Finished vertical reels cut from your long videos, on one fixed monthly price in rupees. I pick the moments, edit them and deliver.",
    cta: "Start your trial: {trial:deposit} down",

    /* Price-currency switch. Prices are written in rupees; visitors from Singapore or the UAE can
       view them in S$ or AED. Live rates come from api.frankfurter.dev when someone first picks
       another currency. If that call fails, the saved rates below are used and labelled with their date.
       Refresh this block now and then (rates = how much of each currency 1 rupee buys):
       https://api.frankfurter.dev/v2/rates?base=INR&quotes=SGD,AED,USD  */
    currencies: ["SGD", "AED"],
    fx: { date: "2026-11-03", rates: { SGD: 0.013492, AED: 0.038721, USD: 0.010544 } },
    included: [
      ["TURNAROUND", "72 hours from footage received"],
      ["REVISIONS", "2 rounds per reel"],
      ["BILLING", "50% to start, 50% on delivery"],
      ["PAID TRIAL", "3 reels for {trial:total}, {trial:deposit} to start"]
    ],

    /* The paid trial card at the top of Packages. Numbers drive the facts list, and
       {price} {reels} {total} {deposit} {balance} in any text below fill in from them,
       so the card cannot disagree with itself. termsUrl must be a path on this site. */
    trial: {
      kicker: "Paid trial",
      title: "Try 3 reels first",
      lede: "Pay half, get 3 finished reels from your own video in 24 hours, and decide with the work in front of you.",
      reels: 3, price: 800, deposit: 1200,
      facts: [
        ["PRICE", "{reels} reels at {price} each, {total} in all"],
        ["TO START", "{deposit}, half up front"],
        ["DELIVERY", "24 hours from payment and footage"],
        ["IF YOU STOP", "Nothing more to pay"]
      ],
      steps: [
        { title: "Send one video. Pay {deposit}. I start.", text: "Any episode, talk or lesson up to 30 minutes. A public link is enough, and your 24 hours begin once the video and payment reach me." },
        { title: "Get {reels} reels in 24 hours", text: "Delivered as watermarked previews, so you can judge the edit." },
        { title: "Like them? Carry on. If not, stop.", text: "The other {balance} is added to your first plan invoice and you get the clean files. If you stop, you owe nothing more." }
      ],
      cta: "Start a trial",
      termsLabel: "Trial terms",
      termsUrl: "/terms#trial"
    },
    plans: [
      { name: "Starter", reels: 8, price: 10000,
        features: [
          "8 finished 9:16 reels from your long-form videos",
          "Best moments picked for your audience, not just the loudest",
          "Hook-first edit, animated captions, zooms, music and sound effects",
          "Captions in English, Hindi or Tamil",
          "2 revision rounds per reel"
        ],
        turnaround: "72 hours from footage received" },
      { name: "Growth", reels: 16, price: 19500,
        features: [
          { lead: "Everything in Starter, plus" },
          "16 finished reels, delivered weekly in batches",
          "A cover frame for every reel",
          "One saved style per brand, so every reel matches",
          "Shared tracker to approve reels in one place"
        ],
        turnaround: "72 hours per batch" },
      { name: "Scale", reels: 30, price: 35000,
        features: [
          { lead: "Everything in Growth, plus" },
          "30 finished reels, about one a day",
          "Reserved capacity: your batches go first in my queue",
          "Up to 3 brand or client styles",
          "Monthly review of which reels worked, to steer the next month"
        ],
        turnaround: "72 hours per batch" },
      { name: "Custom", custom: true, reelsLabel: "40+ reels", priceLabel: "Quoted to fit", perNote: "Roughly {inr:1000} per reel at this volume",
        features: [
          "Tell me your volume, formats and deadlines and I send one fixed monthly quote",
          { lead: "What changes the price" },
          "More than 40 reels a month",
          "Motion-graphic reels",
          "Script-to-post, or scheduling and posting",
          "Delivery faster than 72 hours",
          "Several clients or house styles (agencies)"
        ],
        turnaround: "Fixed quote, agreed before any work starts" }
    ],

    /* Honest side-by-side with real done-for-you clipping companies that publish
       their prices. Everything about them was read from their own pricing pages
       on 2 Nov 2026. Dollar prices are converted at an assumed Rs 88. */
    vs: {
      tabLabel: "vs Other Companies",
      eyebrow: "Compared with real clipping companies",
      title: "Me vs. other clipping companies",
      lede: "These four sell done-for-you reels on monthly plans, the same kind of service as mine. They are the ones with public prices I could check, not an official ranking. Where they are stronger than me, I say so.",
      companiesTitle: "The companies",
      companies: [
        { name: "Vidchops", text: "Dedicated-editor service for YouTubers, billed in dollars. Says it has edited 3,000+ videos.", url: "https://www.vidchops.com/pricing" },
        { name: "Vidpros", text: "Flat monthly plans sold as video output, with a {usd:100} trial week and no more than 4 clients per editor.", url: "https://vidpros.com/pricing/" },
        { name: "Reelkraft Media", text: "Indian studio selling Reels plus graphic posts on rupee retainers from {inr:15000}. Says it has scaled 100+ brands.", url: "https://www.reelkraftmedia.com/pricing" },
        { name: "Suraj Digital", text: "Indian studio with retainers from {inr:15000} for up to 8 Reels. Says it has 120+ clients.", url: "https://surajdigital.com/video-editing/" }
      ],
      choose: [
        { title: "Choose me if", me: true, items: [
          "You want finished reels from long videos at the lowest monthly price for a similar number of reels",
          "You want a person to pick moments for your audience and your offer",
          "Your captions are in English, Hindi or Tamil and you want a native speaker to check them",
          "You want to try 3 reels from your own video for {trial:deposit} down before committing to a plan"
        ] },
        { title: "Choose Vidchops if", items: [
          "You want a dedicated editor and, on the Pro plan, a named account manager",
          "You want a 14-day money-back guarantee",
          "You need 1–2 day turnaround, and long-form videos edited as well"
        ] },
        { title: "Choose Vidpros if", items: [
          "You need 20 to 160 shorts a month, or a mix with long-form videos",
          "You want unlimited revisions and a {usd:100} trial week",
          "You want a project manager and a backup editor (Growth plan)"
        ] },
        { title: "Choose Reelkraft or Suraj Digital if", items: [
          "You want graphic posts or YouTube videos in the same monthly plan (Reelkraft)",
          "You want 24-hour priority delivery or unlimited revisions (Suraj Digital)",
          "You need a multi-editor team or white-label work for your own clients"
        ] }
      ],
      priceTitle: "Pricing comparison",
      priceColumns: ["Monthly volume", "Me", "Vidchops", "Vidpros", "Reelkraft Media", "Suraj Digital"],
      priceColumnSubs: ["", "Rupees", "Dollars", "Dollars", "Rupees", "Rupees"],
      priceRows: [
        ["About 8 reels", { plan: "Starter", text: "a month for 8 reels" }, "Smallest plan: {usda:495} for 16 shorts", "Smallest plan: {usda:1000} for 20–40 shorts", "{inr:15000} for 8 Reels plus 8 graphic posts", "{inr:15000} for up to 8 Reels"],
        ["About 16 reels", { plan: "Growth", text: "a month for 16 reels" }, "{usda:495} for 16 shorts", "{usda:1000} for 20–40 shorts", "{inr:35000} for 20 Reels, 10 posts and 1 YouTube video", "{inr:30000} for up to 20 videos in any format"],
        ["About 30 reels", { plan: "Scale", text: "a month for 30 reels" }, "{usda:995} for up to 32 shorts", "{usda:1000} covers up to 40 shorts", "{inr:70000}+ for 40+ assets across formats", "No plan above 20 videos listed"],
        ["Rough price per reel, at 16 reels", "{inr:1219}", "About {inr:2723}", "About {inr:2200} to {inr:4400}", "About {inr:1750} on Reels alone, or {inr:1129} across all 31 assets", "About {inr:1500} per video"],
        ["Billing", "Rupees. 50% to start, 50% on delivery.","Dollars. No contract, cancel anytime.", "Dollars. No contracts, cancel anytime.", "Rupees. Contract terms not stated.", "Rupees. Contract terms not stated."]
      ],
      priceNote: "Reelkraft Media and Suraj Digital include other formats in the same retainer, so their price per reel is not like for like with mine. Prices were read from each company's own page on 2 Nov 2026 and can change.{fxnote}",
      featureTitle: "Feature comparison",
      featureColumns: ["Feature", "Me", "Vidchops", "Vidpros", "Reelkraft Media", "Suraj Digital"],
      featureGroups: [
        { title: "Reliability", rows: [
          ["Turnaround", "72 hours from footage received, in writing", "1–2 days, guaranteed", "Overnight; shorts next day in batches of 3", "48 hours on Starter, 24 hours on Growth", "24–48 hours for Reels; 24-hour priority on the retainer"],
          ["Revisions", "2 rounds per reel", "3 per video on Weekly; unlimited on Pro", "Unlimited, but each round counts toward your monthly output", "2 rounds on Starter, 4 on Growth, unlimited on Scale", "Unlimited on the {inr:15000} retainer"],
          ["Who edits", "Me, directly", "A dedicated editor; an account manager on Pro", "No more than 4 clients per editor; project manager and backup editor on Growth", "A dedicated senior editor on Growth; a squad on Scale", "A dedicated editor"]
        ] },
        { title: "Trying and fit", rows: [
          ["Try before you commit", "Paid trial: 3 reels for {trial:total}, {trial:deposit} to start, nothing more if you stop","14-day money-back guarantee", "{usd:100} trial week", "Not listed", "Not listed"],
          ["Captions and languages", "English, Hindi, Tamil, with a native-speaker check", "Captions on shorts; language support not stated", "AI captions; language support not stated", "Captions; language support not stated", "Captions; language support not stated"],
          ["Left out of the base price", "Posting and scheduling, scripts, thumbnails", "Captions: the plan page says included, the FAQ lists {usd:95} a month extra", "Revision rounds use up your monthly output", "YouTube videos and ad variants on Starter; a strategist", "Not stated"]
        ] },
        { title: "Proof on their own site", rows: [
          ["What they show", "The films in the portfolio above", "Says 3,000+ videos edited, plus client testimonials", "One case study; no client total", "Says 100+ brands; no named clients", "Says 120+ clients and 500+ videos this year"]
        ] }
      ],
      featureNote: "The Me column states what I offer, not past results. Claims marked as what a company says come from its own site and are not verified.",
      stepsTitle: "Getting started",
      steps: [
        { title: "Send one long video", text: "An episode, a lesson or a recording you already have. A public link is enough." },
        { title: "Try 3 reels for {trial:deposit} down", text: "I make 3 finished reels from it in 24 hours, so you judge the work before committing." },
        { title: "Pick a package", text: "Starter, Growth, Scale or a custom quote. 50% to start, 50% on delivery." },
        { title: "Reels arrive in 72 hours", text: "Counted from the day I have all your footage. Send one list of changes, up to 2 rounds." }
      ],
      faqTitle: "Common questions",
      faq: [
        ["Why not hire one of the bigger companies?", "If you need dozens of shorts a month, long-form edits, a project manager or same-day delivery, the larger teams are built for that. I am a solo editor, so I take fewer clients and you work with me directly, at a lower price."],
        ["Why is your turnaround slower than theirs?", "These companies list 24 to 48 hours for most plans. I promise 72 hours in writing, counted from the day I have all your footage, and keep it on every reel."],
        ["Do you use AI too?", "Yes. I use AI tools for transcription and cutting assistance, and I review every reel myself. I do not create AI people or fully generated videos."],
        ["Can you handle podcasts with several speakers?", "Face-aware reframing for several speakers is not automated on my side yet. Those reels are reframed by hand, and I confirm that with you at the trial stage."],
        ["What happens if I don't like the trial?", "You stop there and the other {trial:balance} is never due. The {trial:deposit} you paid to start is not refundable, because the 3 reels were made. The trial is limited to one per client or brand. The full wording is on the terms page."],
        ["Do you post the reels for me?", "Not in the base packages. Posting and scheduling is an add-on that I quote separately."],
        ["What if I need more than 30 reels a month?", "Use the Custom plan. Tell me your volume, formats and deadlines and I send a fixed monthly quote, at roughly {inr:1000} per reel at this volume."]
      ],
      sources: [
        { label: "Vidchops", url: "https://www.vidchops.com/pricing" },
        { label: "Vidpros", url: "https://vidpros.com/pricing/" },
        { label: "Reelkraft Media", url: "https://www.reelkraftmedia.com/pricing" },
        { label: "Suraj Digital", url: "https://surajdigital.com/video-editing/" }
      ],
      sourceNote: "Read on 2 Nov 2026. Not affiliated with any of these companies."
    },

    /* Every way to get reels made, side by side. */
    options: {
      title: "Five ways to get 16 reels a month",
      lede: "Monthly cost for a fixed number of reels, drawn to one scale. The cheapest options leave the work with you: the tool needs an operator, and a hire needs software, briefing and management. Only one of these is done-for-you at a fixed price.",
      chart: {
        max: 150000, step: 25000,
        rows: [
          { name: "AI clipper tool plan", lo: 1320, hi: 3432, label: "{usda:15-39}" },
          { name: "In-house editor, base salary", lo: 18000, hi: 35000, label: "{inr:18000-35000}" },
          { name: "Me, 16 reels (Growth)", lo: 19500, hi: 19500, label: "{inr:19500}", mine: true },
          { name: "Freelance editor, 16 reels", lo: 16000, hi: 80000, label: "{inr:16000-80000}" },
          { name: "Agency retainer", lo: 25000, hi: 150000, label: "{inr:25000-150000}+" }
        ],
        note: "Tool prices are in US dollars.{fxnote} Freelance cost is the stated {inr:1000-5000} per reel times 16. Agency retainers cover 12–20+ reels. Salary is base pay only."
      },
      tableTitle: "Side by side, on what buyers check",
      columns: ["What you compare", "Me", "AI clipper tool", "Freelance editor", "Agency or studio", "In-house editor"],
      columnSubs: ["", "Done-for-you monthly reels", "Software you run yourself", "Marketplace or DM", "Retainer", "Salaried hire"],
      groups: [
        { title: "Cost", rows: [
          ["Monthly cost, about 16 reels", "{inr:19500} fixed ({inr:1219} per reel)", "{usd:15-39} for a plan (about {inr:1300-3400}), plus your own time", "{inr:16000-80000} ({inr:1000-5000} per reel)", "{inr:25000-150000}+ (retainers for 12–20+ reels)", "{inr:18000-35000} base salary, before software and management time"],
          ["How the price behaves", "Fixed monthly, agreed before work starts", "Fixed plan, capped by a monthly credit limit", "Per reel; extra revisions are billed", "Monthly retainer; rush delivery adds 20–60% across the market", "Same salary however much gets made"]
        ] },
        { title: "Quality of the reels", rows: [
          ["Who picks the moments", "A person, using your audience and offer as the brief", "An algorithm ranks clips by a virality score. Reviewers report uneven scoring, though one found it useful for sorting", "The editor, unless you pick for them", "The agency's editor or strategist", "Your employee, who knows your brand best"],
          ["Reels ready to post", "Delivered finished after a written quality checklist: hook in 2 seconds, captions checked, loudness matched", "Reviews range from about 80% ready with caption tweaks to only a few usable; clips sometimes cut before a thought ends", "Delivered finished; quality depends on the seller, so check samples in your niche", "Delivered finished; check samples in your niche", "Delivered finished; quality depends on the person hired"],
          ["Matching your brand style", "A saved style per brand (Growth and up)", "Templates and brand settings; the Pro plan lists up to four brand templates", "Depends on the seller", "Depends on the agency", "Consistent once trained"]
        ] },
        { title: "Your effort", rows: [
          ["Work left for you", "Send footage, approve reels, send one list of changes", "Upload, review every clip, fix captions and cut points, export", "Brief, give feedback, follow up", "Brief and approve", "Brief, manage, review"]
        ] },
        { title: "Reliability", rows: [
          ["Turnaround", "72 hours from footage received, written into the agreement", "Minutes to process, then your review time", "No market standard is published; agree it before you start", "No market standard is published; agree it before you start", "Same day is possible, within one person's workload"],
          ["Revisions", "2 rounds per reel included", "You make the changes yourself", "Usually 1–2 rounds, then billed", "Usually 1–2 rounds, then billed", "Unlimited, but it uses their time"],
          ["Changing volume", "Switch between 8, 16, 30 or 40+ reels each month", "Limited by plan credits", "Limited by one person's time", "The retainer sets the count", "Fixed capacity; more volume means another hire"],
          ["Trying before paying", "Paid trial: 3 reels for {trial:total}, with {trial:deposit} down", "Free plans exist, with watermarked exports and a 3-day expiry", "Varies by seller", "Varies by agency", "Through the hiring process"]
        ] },
        { title: "Fit", rows: [
          ["Best when", "You have long-form footage, want finished reels every week and do not want to manage an editor", "You have the time and a tight budget", "You need small, occasional batches from someone you trust", "You also need strategy, shooting or posting", "Video is daily work across many formats"],
          ["Look elsewhere when", "You want shooting, scripting, posting, or the lowest price available", "Every reel has to be right without a review", "You need a guaranteed volume every week", "Your budget is under about {inr:25000} a month, their retainer floor", "The output would not justify a salary"]
        ] }
      ],
      sources: [
        { label: "Reel editing rates, Viptro", url: "https://viptro.com/reels-editing-charges-india/" },
        { label: "Reel editing rates, Plumlet", url: "https://plumlet.app/reel-editing-charges-india" },
        { label: "Editor salaries, Fueler", url: "https://fueler.io/blog/video-editor-salary-in-india" },
        { label: "OpusClip pricing", url: "https://www.opus.pro/pricing" }
      ],
      sourceNote: "Rates are asking prices from sellers, read in Nov 2026. India has no official tariff for freelance editing. Check any figure before relying on it."
    }
  }
};
