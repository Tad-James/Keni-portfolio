(function () {
  "use strict";

  /*
   * Pricing section. All words and numbers live in site-content.js (`pricing`);
   * this file only turns them into elements. It builds the DOM with textContent
   * and CSSOM styles, never inline markup, because the site's CSP blocks
   * inline scripts and style attributes.
   */
  var data = (window.KENISHA_PORTFOLIO || {}).pricing;
  var section = document.getElementById("pricing");
  var navLink = document.querySelector('.main-nav a[href="#pricing"]');
  var moneyFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

  /* ── tiny helpers (same shape as app.js) ──────────────────────────── */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function clean(value) { return typeof value === "string" ? value.trim() : ""; }
  function pad(n) { return String(n).padStart(2, "0"); }
  function percent(value, max) { return (value / max * 100) + "%"; }
  function formatMoney(amount) { return "₹" + moneyFormat.format(Math.round(amount)); }
  function safeHttps(value) {
    try {
      var url = new URL(clean(value));
      return url.protocol === "https:" ? url.href : "";
    } catch (error) { return ""; }
  }
  function externalLink(label, href, className) {
    var link = el("a", className || "", label);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  /* ── plan cards ───────────────────────────────────────────────────── */
  function planHead(plan, index) {
    var head = el("div", "plan-head plan-tone-" + ((index % 4) + 1));
    var top = el("div", "plan-top");
    top.appendChild(el("span", "plan-name", plan.name));
    top.appendChild(el("span", "plan-reels", plan.custom ? clean(plan.reelsLabel) : plan.reels + " reels / mo"));
    head.appendChild(top);

    var price = el("p", "plan-price");
    if (plan.custom) {
      price.appendChild(el("span", "plan-amount is-text", clean(plan.priceLabel)));
    } else {
      price.appendChild(el("span", "plan-amount", formatMoney(plan.price)));
      price.appendChild(el("span", "plan-unit", "/ month"));
    }
    head.appendChild(price);
    head.appendChild(el("p", "plan-per", plan.custom ? clean(plan.perNote) : formatMoney(plan.price / plan.reels) + " per reel"));
    return head;
  }

  // A feature is plain text, or { lead } for a bold lead-in line.
  function featureList(features) {
    var list = el("ul", "plan-feats");
    (features || []).forEach(function (feature) {
      var lead = typeof feature === "object" && feature;
      list.appendChild(el("li", lead ? "is-lead" : "", lead ? feature.lead : feature));
    });
    return list;
  }

  function planCard(plan, index) {
    var card = el("article", "plan-card" + (plan.custom ? " is-custom" : ""));
    card.appendChild(planHead(plan, index));
    var body = el("div", "plan-body");
    body.appendChild(featureList(plan.features));
    body.appendChild(el("p", "plan-foot", clean(plan.turnaround)));
    card.appendChild(body);
    return card;
  }

  function includedList(pairs) {
    var terms = el("dl", "detail-list plan-terms");
    (pairs || []).forEach(function (pair) {
      var row = el("div");
      row.appendChild(el("dt", "", pair[0]));
      row.appendChild(el("dd", "", pair[1]));
      terms.appendChild(row);
    });
    terms.hidden = !terms.children.length;
    return terms;
  }

  /* ── paid trial card ──────────────────────────────────────────────── */
  // Fills {price} {reels} {total} {deposit} {balance} from the trial's own numbers.
  function trialText(trial, text) {
    var total = trial.reels * trial.price;
    var values = {
      price: formatMoney(trial.price), reels: String(trial.reels), total: formatMoney(total),
      deposit: formatMoney(trial.deposit), balance: formatMoney(total - trial.deposit)
    };
    return clean(text).replace(/\{(\w+)\}/g, function (match, key) {
      return values.hasOwnProperty(key) ? values[key] : match;
    });
  }

  // Only a path on this site may be linked, so content can never point the card elsewhere.
  function sitePath(value) {
    var path = clean(value);
    return /^\/[\w\-./#]*$/.test(path) && path.indexOf("//") !== 0 ? path : "";
  }

  function trialSteps(trial) {
    var list = el("ol", "trial-steps");
    (trial.steps || []).forEach(function (step) {
      var item = el("li");
      item.appendChild(el("strong", "", trialText(trial, step.title)));
      item.appendChild(el("span", "", trialText(trial, step.text)));
      list.appendChild(item);
    });
    return list;
  }

  function trialMain(trial) {
    var main = el("div", "trial-main plan-tone-2");
    main.appendChild(el("p", "pricing-kicker", clean(trial.kicker)));
    main.appendChild(el("h3", "trial-title", clean(trial.title)));
    main.appendChild(el("p", "trial-lede", trialText(trial, trial.lede)));

    var actions = el("div", "trial-actions");
    var start = el("a", "button button-primary", clean(trial.cta) || "Start a trial");
    start.href = "#contact";
    var arrow = el("span", "button-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    start.appendChild(arrow);
    actions.appendChild(start);
    var termsPath = sitePath(trial.termsUrl);
    if (termsPath) {
      var terms = el("a", "card-link", clean(trial.termsLabel) || "Trial terms");
      terms.href = termsPath;
      actions.appendChild(terms);
    }
    main.appendChild(actions);
    return main;
  }

  function trialCard(trial) {
    var card = el("article", "trial-card");
    card.appendChild(trialMain(trial));
    var side = el("div", "trial-side");
    side.appendChild(includedList((trial.facts || []).map(function (pair) {
      return [pair[0], trialText(trial, pair[1])];
    })));
    side.appendChild(trialSteps(trial));
    card.appendChild(side);
    return card;
  }

  function renderPackages(panel) {
    if (data.trial) panel.appendChild(trialCard(data.trial));
    var grid = el("div", "plan-grid");
    data.plans.forEach(function (plan, index) { grid.appendChild(planCard(plan, index)); });
    panel.appendChild(grid);
    panel.appendChild(includedList(data.included));

    var action = el("a", "button button-primary plan-cta", clean(data.cta) || "Get in touch");
    action.href = "#contact";
    var arrow = el("span", "button-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    action.appendChild(arrow);
    panel.appendChild(action);
  }

  /* ── comparison tables ────────────────────────────────────────────── */
  // A cell is plain text, or { plan, text } to show a live plan price (so it can never drift from the cards).
  function fillCell(cell, value) {
    var plan = value && typeof value === "object"
      ? data.plans.filter(function (p) { return p.name === value.plan; })[0] : null;
    if (!plan) { cell.textContent = typeof value === "string" ? value : ""; return; }
    cell.appendChild(el("strong", "cell-price", formatMoney(plan.price)));
    cell.appendChild(document.createTextNode(" " + value.text));
  }

  function tableHead(columns, subs) {
    var head = el("thead");
    var row = el("tr");
    columns.forEach(function (label, i) {
      var th = el("th", i === 1 ? "is-me" : "", label);
      th.scope = "col";
      if (subs && subs[i]) th.appendChild(el("span", "col-sub", subs[i]));
      row.appendChild(th);
    });
    head.appendChild(row);
    return head;
  }

  function tableRow(columns, cells) {
    var row = el("tr");
    var th = el("th", "", cells[0]);
    th.scope = "row";
    row.appendChild(th);
    cells.slice(1).forEach(function (value, i) {
      // data-label lets the phone layout stack each cell under its own column name.
      var td = el("td", i === 0 ? "is-me" : "");
      td.dataset.label = columns[i + 1];
      fillCell(td, value);
      row.appendChild(td);
    });
    return row;
  }

  function buildTable(columns, groups, subs) {
    var table = el("table", "cmp-table cols-" + columns.length);
    table.appendChild(tableHead(columns, subs));
    var body = el("tbody");
    groups.forEach(function (group) {
      if (group.title) {
        var heading = el("tr", "group");
        var th = el("th", "", group.title);
        th.colSpan = columns.length;
        heading.appendChild(th);
        body.appendChild(heading);
      }
      group.rows.forEach(function (cells) { body.appendChild(tableRow(columns, cells)); });
    });
    table.appendChild(body);
    return table;
  }

  function sourceLine(sources, note) {
    var line = el("p", "pricing-note");
    var links = (sources || []).map(function (s) { return { label: clean(s.label), url: safeHttps(s.url) }; })
      .filter(function (s) { return s.label && s.url; });
    if (links.length) line.appendChild(document.createTextNode("Sources: "));
    links.forEach(function (s, i) {
      line.appendChild(externalLink(s.label, s.url));
      line.appendChild(document.createTextNode(i < links.length - 1 ? ", " : ". "));
    });
    line.appendChild(document.createTextNode(clean(note)));
    return line;
  }

  function block(title, lede) {
    var wrap = el("div", "pricing-block");
    if (title) wrap.appendChild(el("h3", "pricing-subtitle", title));
    if (lede) wrap.appendChild(el("p", "pricing-lede", lede));
    return wrap;
  }

  /* ── "vs other companies" view ────────────────────────────────────── */
  function chooseCard(card) {
    var node = el("article", "choose-card" + (card.me ? " is-me" : ""));
    node.appendChild(el("h3", "", card.title));
    node.appendChild(featureList(card.items));
    return node;
  }

  function companyCard(company, index) {
    var card = el("div", "built-card built-tone-" + ((index % 4) + 1));
    card.appendChild(el("h4", "", company.name));
    card.appendChild(el("p", "", company.text));
    var url = safeHttps(company.url);
    if (url) card.appendChild(externalLink("Their pricing page ↗", url, "card-link"));
    return card;
  }

  function vsIntro(panel, vs) {
    var intro = el("div", "vs-intro");
    intro.appendChild(el("p", "pricing-kicker", vs.eyebrow));
    intro.appendChild(el("h3", "vs-title", vs.title));
    intro.appendChild(el("p", "pricing-lede", vs.lede));
    panel.appendChild(intro);

    var companies = block(vs.companiesTitle);
    var cards = el("div", "built-grid");
    vs.companies.forEach(function (company, i) { cards.appendChild(companyCard(company, i)); });
    companies.appendChild(cards);
    panel.appendChild(companies);

    var choose = el("div", "choose-grid");
    vs.choose.forEach(function (card) { choose.appendChild(chooseCard(card)); });
    panel.appendChild(choose);
  }

  function vsTables(panel, vs) {
    var price = block(vs.priceTitle);
    price.appendChild(buildTable(vs.priceColumns, [{ rows: vs.priceRows }], vs.priceColumnSubs));
    price.appendChild(el("p", "pricing-note", vs.priceNote));
    panel.appendChild(price);

    var features = block(vs.featureTitle);
    features.appendChild(buildTable(vs.featureColumns, vs.featureGroups, vs.priceColumnSubs));
    features.appendChild(el("p", "pricing-note", vs.featureNote));
    panel.appendChild(features);
  }

  function vsTail(panel, vs) {
    var steps = block(vs.stepsTitle);
    var list = el("ol", "steps");
    vs.steps.forEach(function (step) {
      var item = el("li");
      item.appendChild(el("strong", "", step.title));
      item.appendChild(el("span", "", step.text));
      list.appendChild(item);
    });
    steps.appendChild(list);
    panel.appendChild(steps);

    var faq = block(vs.faqTitle);
    var items = el("div", "faq");
    vs.faq.forEach(function (pair) {
      var details = el("details");
      details.appendChild(el("summary", "", pair[0]));
      details.appendChild(el("p", "", pair[1]));
      items.appendChild(details);
    });
    faq.appendChild(items);
    faq.appendChild(sourceLine(vs.sources, vs.sourceNote));
    panel.appendChild(faq);
  }

  /* ── "all options" view ───────────────────────────────────────────── */
  // Rows share one linear scale so bar length means the same thing in every row.
  function chartRow(row, max, step) {
    var item = el("div", "cost-row" + (row.mine ? " is-mine" : ""));
    var head = el("div", "cost-head");
    head.appendChild(el("span", "", row.name));
    head.appendChild(el("span", "cost-value", row.label));
    var track = el("div", "cost-track");
    track.style.backgroundSize = percent(step, max) + " 100%";
    var fill = el("div", "cost-fill");
    fill.style.left = percent(row.lo, max);
    fill.style.width = Math.max((row.hi - row.lo) / max * 100, 1.2) + "%";
    track.appendChild(fill);
    item.appendChild(head);
    item.appendChild(track);
    return item;
  }

  function chartAxis(max, step) {
    var axis = el("div", "cost-axis");
    for (var tick = 0; tick <= max; tick += step) {
      var label = el("span", "", tick === 0 ? "0" : "₹" + (tick / 1000) + "k");
      label.style.left = percent(tick, max);
      axis.appendChild(label);
    }
    return axis;
  }

  function costChart(chart) {
    var wrap = el("div", "cost-chart");
    wrap.setAttribute("role", "img");
    wrap.setAttribute("aria-label", "Monthly cost range for each option: " +
      chart.rows.map(function (r) { return r.name + ", " + r.label; }).join("; "));
    chart.rows.forEach(function (row) { wrap.appendChild(chartRow(row, chart.max, chart.step)); });
    wrap.appendChild(chartAxis(chart.max, chart.step));
    return wrap;
  }

  function renderOptions(panel) {
    var options = data.options;
    var chartBlock = block(options.title, options.lede);
    chartBlock.appendChild(costChart(options.chart));
    chartBlock.appendChild(el("p", "pricing-note", options.chart.note));
    panel.appendChild(chartBlock);

    var tableBlock = block(options.tableTitle);
    tableBlock.appendChild(buildTable(options.columns, options.groups, options.columnSubs));
    tableBlock.appendChild(sourceLine(options.sources, options.sourceNote));
    panel.appendChild(tableBlock);
  }

  /* ── views (tabs) ─────────────────────────────────────────────────── */
  function setupViews() {
    var bar = document.getElementById("pricing-tabs");
    var views = [
      { label: "Packages", panel: document.getElementById("pricing-packages") },
      { label: clean(data.vs.tabLabel) || "vs Others", panel: document.getElementById("pricing-vs") },
      { label: "All options", panel: document.getElementById("pricing-options") }
    ];
    var chips = views.map(function (view, i) {
      var chip = el("button", "filter-chip" + (i === 0 ? " is-active" : ""), view.label);
      chip.type = "button";
      chip.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      chip.addEventListener("click", function () {
        views.forEach(function (v, j) {
          chips[j].classList.toggle("is-active", j === i);
          chips[j].setAttribute("aria-pressed", j === i ? "true" : "false");
          v.panel.hidden = j !== i;
        });
      });
      bar.appendChild(chip);
      return chip;
    });
  }

  /* ── boot ─────────────────────────────────────────────────────────── */
  function boot() {
    if (!section) return;
    if (!data || !Array.isArray(data.plans) || !data.plans.length || !data.vs || !data.options) {
      section.hidden = true;
      if (navLink) navLink.hidden = true;
      return;
    }
    var lede = clean(data.lede);
    if (lede) document.getElementById("pricing-lede").textContent = lede;
    document.getElementById("pricing-count").textContent = pad(data.plans.length);

    var vsPanel = document.getElementById("pricing-vs");
    renderPackages(document.getElementById("pricing-packages"));
    vsIntro(vsPanel, data.vs);
    vsTables(vsPanel, data.vs);
    vsTail(vsPanel, data.vs);
    renderOptions(document.getElementById("pricing-options"));
    setupViews();
  }

  boot();
})();
