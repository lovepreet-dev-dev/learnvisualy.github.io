/* ══════════════════════════════════════════════════════════════
   SITE SHELL

   The navigation furniture every documentation site is expected to
   have, generated from the catalog so it can never drift out of sync
   with the pages that actually exist:

     · a collapsible sidebar listing every concept, grouped by category,
       with the current page marked
     · a search palette on ⌘K / Ctrl+K (and "/"), matching title,
       summary and category
     · previous / next links so the whole syllabus can be read in order
     · a footer

   Injected into the existing markup rather than requiring every page to
   be rewritten.
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const catalog = window.MLAlgorithms;
  if (!catalog) return;

  const page = document.body.dataset.page;
  const atRoot = page === "home";
  const prefix = atRoot ? "./pages/" : "./";
  const rootPrefix = atRoot ? "./" : "../";

  const params = new URLSearchParams(window.location.search);
  const currentId = page === "algorithm" ? params.get("id") : null;
  const currentCategory = document.body.dataset.category || null;

  /* Reading order: categories in catalog order, pages in their own
     order within each. This is what prev/next walks. */
  const ordered = catalog.categories.flatMap((category) => catalog.byCategory(category.id));

  function algorithmHref(id) {
    return `${prefix}algorithm.html?id=${id}`;
  }

  function categoryHref(category) {
    return `${prefix}${category.page}`;
  }

  /* ── Sidebar ──────────────────────────────────────────────── */
  function buildSidebar() {
    const nav = document.createElement("nav");
    nav.className = "site-sidebar";
    nav.id = "site-sidebar";
    nav.setAttribute("aria-label", "All concepts");

    nav.innerHTML = `
      <div class="sidebar-head">
        <button type="button" class="sidebar-search" id="sidebar-search">
          <span>Search concepts…</span>
          <kbd>⌘K</kbd>
        </button>
      </div>
      <a class="sidebar-link sidebar-home${atRoot ? " is-current" : ""}" href="${rootPrefix}index.html">Home</a>
      ${catalog.categories
        .map((category) => {
          const entries = catalog.byCategory(category.id);
          const open = currentCategory === category.id || entries.some((entry) => entry.id === currentId);
          return `
            <section class="sidebar-group${open ? " is-open" : ""}">
              <button type="button" class="sidebar-group-title" aria-expanded="${open}">
                <span>${category.title}</span>
                <span class="sidebar-count">${entries.length}</span>
              </button>
              <div class="sidebar-group-body">
                <a class="sidebar-link sidebar-overview${currentCategory === category.id ? " is-current" : ""}"
                   href="${categoryHref(category)}">Overview</a>
                ${entries
                  .map(
                    (entry) => `
                      <a class="sidebar-link${entry.id === currentId ? " is-current" : ""}"
                         href="${algorithmHref(entry.id)}">${entry.title}</a>
                    `
                  )
                  .join("")}
              </div>
            </section>
          `;
        })
        .join("")}
    `;
    return nav;
  }

  /* ── Search palette ───────────────────────────────────────── */
  function buildPalette() {
    const overlay = document.createElement("div");
    overlay.className = "palette-overlay";
    overlay.id = "palette-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="palette" role="dialog" aria-modal="true" aria-label="Search concepts">
        <input type="text" id="palette-input" placeholder="Search concepts, categories, formulas…" autocomplete="off" />
        <div class="palette-results" id="palette-results"></div>
        <div class="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
    return overlay;
  }

  const searchIndex = [
    ...catalog.categories.map((category) => ({
      title: category.title,
      subtitle: category.description,
      kind: "Category",
      href: categoryHref(category),
      haystack: `${category.title} ${category.description}`.toLowerCase(),
    })),
    ...ordered.map((entry) => ({
      title: entry.title,
      subtitle: entry.summary,
      kind: catalog.categories.find((category) => category.id === entry.category).title,
      href: algorithmHref(entry.id),
      haystack: `${entry.title} ${entry.summary} ${entry.category} ${entry.engine}`.toLowerCase(),
    })),
  ];

  function score(item, query) {
    const title = item.title.toLowerCase();
    if (title === query) return 0;
    if (title.startsWith(query)) return 1;
    if (title.includes(query)) return 2;
    if (item.haystack.includes(query)) return 3;
    /* Loose subsequence match so "knn" finds "k-Nearest Neighbour". */
    let cursor = 0;
    for (const ch of query) {
      cursor = title.indexOf(ch, cursor);
      if (cursor === -1) return null;
      cursor += 1;
    }
    return 4;
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return searchIndex.slice(0, 8);
    return searchIndex
      .map((item) => ({ item, rank: score(item, q) }))
      .filter((row) => row.rank !== null)
      .sort((a, b) => a.rank - b.rank || a.item.title.length - b.item.title.length)
      .slice(0, 12)
      .map((row) => row.item);
  }

  /* ── Prev / next ──────────────────────────────────────────── */
  function buildPager() {
    if (page !== "algorithm" || !currentId) return null;
    const index = ordered.findIndex((entry) => entry.id === currentId);
    if (index === -1) return null;

    const previous = ordered[index - 1];
    const next = ordered[index + 1];
    const pager = document.createElement("nav");
    pager.className = "pager";
    pager.setAttribute("aria-label", "Previous and next concept");
    pager.innerHTML = `
      ${
        previous
          ? `<a class="pager-link pager-prev" href="${algorithmHref(previous.id)}">
               <span class="pager-dir">← Previous</span>
               <span class="pager-title">${previous.title}</span>
             </a>`
          : "<span></span>"
      }
      ${
        next
          ? `<a class="pager-link pager-next" href="${algorithmHref(next.id)}">
               <span class="pager-dir">Next →</span>
               <span class="pager-title">${next.title}</span>
             </a>`
          : "<span></span>"
      }
    `;
    return pager;
  }

  function buildFooter() {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="footer-grid">
        <div>
          <div class="brand">Machine Learning Studio</div>
          <p>${ordered.length} interactive concept pages. Change the inputs, read the substituted formula, step the algorithm.</p>
        </div>
        ${catalog.categories
          .map(
            (category) => `
              <div>
                <h4>${category.title}</h4>
                <ul>
                  ${catalog
                    .byCategory(category.id)
                    .slice(0, 5)
                    .map((entry) => `<li><a href="${algorithmHref(entry.id)}">${entry.title}</a></li>`)
                    .join("")}
                  <li><a class="muted-link" href="${categoryHref(category)}">All ${category.title.toLowerCase()} →</a></li>
                </ul>
              </div>
            `
          )
          .join("")}
      </div>
      <p class="footer-legal">Built as a static site — no tracking, no build step. Press <kbd>⌘K</kbd> to search.</p>
    `;
    return footer;
  }

  /* ── Assembly ─────────────────────────────────────────────── */
  function init() {
    const shell = document.querySelector(".site-shell");
    if (!shell) return;

    document.body.classList.add("has-shell");

    /* Sidebar toggle lives in the topbar next to the brand. */
    const topbar = shell.querySelector(".topbar");
    if (topbar) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "sidebar-toggle";
      toggle.id = "sidebar-toggle";
      toggle.setAttribute("aria-label", "Toggle navigation sidebar");
      toggle.innerHTML = "<span></span><span></span><span></span>";
      topbar.insertBefore(toggle, topbar.firstChild);

      const searchButton = document.createElement("button");
      searchButton.type = "button";
      searchButton.className = "topbar-search";
      searchButton.id = "topbar-search";
      searchButton.innerHTML = `<span aria-hidden="true">⌕</span><span class="topbar-search-label">Search</span><kbd>⌘K</kbd>`;
      topbar.appendChild(searchButton);
    }

    /* Wrap everything below the topbar so the sidebar can sit beside it. */
    const layout = document.createElement("div");
    layout.className = "shell-layout";
    const main = document.createElement("main");
    main.className = "shell-main";
    main.id = "main-content";

    const children = Array.from(shell.children).filter((node) => !node.classList.contains("topbar"));
    children.forEach((node) => main.appendChild(node));

    layout.appendChild(buildSidebar());
    layout.appendChild(main);
    shell.appendChild(layout);

    const pager = buildPager();
    if (pager) main.appendChild(pager);
    main.appendChild(buildFooter());

    document.body.appendChild(buildPalette());

    wireSidebar();
    wirePalette();
  }

  function wireSidebar() {
    const sidebar = document.getElementById("site-sidebar");
    const toggle = document.getElementById("sidebar-toggle");

    const stored = window.localStorage.getItem("mls-sidebar");
    if (stored === "closed") document.body.classList.add("sidebar-closed");

    if (toggle) {
      toggle.addEventListener("click", () => {
        const closed = document.body.classList.toggle("sidebar-closed");
        window.localStorage.setItem("mls-sidebar", closed ? "closed" : "open");
      });
    }

    /* Collapsible category groups. */
    sidebar.querySelectorAll(".sidebar-group-title").forEach((button) => {
      button.addEventListener("click", () => {
        const group = button.closest(".sidebar-group");
        const open = group.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(open));
      });
    });

    /* Keep the active entry in view on load. */
    const current = sidebar.querySelector(".sidebar-link.is-current");
    if (current) {
      window.requestAnimationFrame(() => {
        const box = current.getBoundingClientRect();
        if (box.top < 0 || box.bottom > window.innerHeight) {
          current.scrollIntoView({ block: "center" });
        }
      });
    }

    /* Tapping the backdrop closes the sidebar on small screens. */
    document.addEventListener("click", (event) => {
      if (window.innerWidth > 1080) return;
      if (document.body.classList.contains("sidebar-closed")) return;
      if (sidebar.contains(event.target) || event.target.closest("#sidebar-toggle")) return;
      document.body.classList.add("sidebar-closed");
    });
  }

  function wirePalette() {
    const overlay = document.getElementById("palette-overlay");
    const input = document.getElementById("palette-input");
    const results = document.getElementById("palette-results");
    let active = 0;
    let items = [];

    function paint(query) {
      items = search(query);
      active = 0;
      results.innerHTML = items.length
        ? items
            .map(
              (item, index) => `
                <a class="palette-item${index === 0 ? " is-active" : ""}" href="${item.href}" data-index="${index}">
                  <span class="palette-kind">${item.kind}</span>
                  <span class="palette-title">${item.title}</span>
                  <span class="palette-sub">${item.subtitle}</span>
                </a>
              `
            )
            .join("")
        : `<p class="palette-empty">Nothing matches “${query}”.</p>`;
    }

    function move(delta) {
      if (!items.length) return;
      active = (active + delta + items.length) % items.length;
      results.querySelectorAll(".palette-item").forEach((node, index) => {
        node.classList.toggle("is-active", index === active);
        if (index === active) node.scrollIntoView({ block: "nearest" });
      });
    }

    function open() {
      overlay.hidden = false;
      document.body.classList.add("palette-open");
      input.value = "";
      paint("");
      input.focus();
    }

    function close() {
      overlay.hidden = true;
      document.body.classList.remove("palette-open");
    }

    document.getElementById("topbar-search")?.addEventListener("click", open);
    document.getElementById("sidebar-search")?.addEventListener("click", open);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });

    input.addEventListener("input", () => paint(input.value));

    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const target = results.querySelectorAll(".palette-item")[active];
        if (target) window.location.href = target.getAttribute("href");
      } else if (event.key === "Escape") {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      const typingTarget =
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.tagName === "SELECT";

      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        overlay.hidden ? open() : close();
        return;
      }
      if (event.key === "/" && !typingTarget && overlay.hidden) {
        event.preventDefault();
        open();
        return;
      }
      if (event.key === "Escape" && !overlay.hidden) close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
