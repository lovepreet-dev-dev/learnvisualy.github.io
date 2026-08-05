(function () {
  const catalog = window.MLAlgorithms;
  const U = window.MLUtils;

  if (!catalog || !document.body.dataset.page || document.body.dataset.page === "algorithm") {
    return;
  }

  function pagePrefix() {
    return document.body.dataset.page === "home" ? "./pages/" : "./";
  }

  function algorithmHref(id) {
    return `${pagePrefix()}algorithm.html?id=${id}`;
  }

  function categoryHref(page) {
    return `${pagePrefix()}${page}`;
  }

  function renderCategoryCard(category) {
    const entries = catalog.byCategory(category.id);
    return `
      <a class="category-banner card-link" href="${categoryHref(category.page)}">
        <div class="meta">
          <span>${entries.length} pages</span>
          <span>${category.title}</span>
        </div>
        <h3>${category.title}</h3>
        <p>${category.description}</p>
        <div class="pill-list">
          ${entries.slice(0, 5).map((entry) => `<span>${entry.title}</span>`).join("")}
        </div>
      </a>
    `;
  }

  function renderAlgorithmCard(entry) {
    return `
      <a class="algorithm-card card-link" href="${algorithmHref(entry.id)}">
        <div class="meta">
          <span>${catalog.categories.find((category) => category.id === entry.category).title}</span>
        </div>
        <h3>${entry.title}</h3>
        <p>${entry.summary}</p>
      </a>
    `;
  }

  if (document.body.dataset.page === "home") {
    const categoryNode = U.qs("#home-categories");
    const algorithmsNode = U.qs("#home-algorithms");
    if (categoryNode) {
      categoryNode.innerHTML = catalog.categories.map(renderCategoryCard).join("");
    }
    if (algorithmsNode) {
      algorithmsNode.innerHTML = Object.values(catalog.algorithms)
        .sort((a, b) => a.order - b.order)
        .map(renderAlgorithmCard)
        .join("");
    }
    return;
  }

  if (document.body.dataset.page === "category") {
    const categoryId = document.body.dataset.category;
    const category = catalog.categories.find((entry) => entry.id === categoryId);
    const bannerNode = U.qs("#category-banner");
    const algorithmsNode = U.qs("#category-algorithms");
    if (!category || !bannerNode || !algorithmsNode) {
      return;
    }
    const entries = catalog.byCategory(categoryId);
    bannerNode.innerHTML = `
      <article class="category-banner">
        <div class="meta">
          <span>${entries.length} pages</span>
          <span>read in order</span>
        </div>
        <h3>${category.title}</h3>
        <p>${category.description}</p>
        <p style="margin-top:14px">
          <a class="button primary" href="${algorithmHref(entries[0].id)}">Start with ${entries[0].title}</a>
        </p>
      </article>
    `;

    /* A route rather than a grid. These pages are ordered — each one
       links to the next — so presenting them as an unordered wall of
       identical cards hid the one piece of structure they have. */
    algorithmsNode.classList.remove("algorithm-list");
    algorithmsNode.classList.add("track");
    algorithmsNode.innerHTML = entries
      .map(
        (entry, index) => `
          <a class="track-step" href="${algorithmHref(entry.id)}">
            <span class="track-num">${String(index + 1).padStart(2, "0")}</span>
            <span class="track-body">
              <span class="track-title">${entry.title}</span>
              <span class="track-summary">${entry.summary}</span>
            </span>
            <span class="track-go" aria-hidden="true">→</span>
          </a>
        `
      )
      .join("");
    U.qsa(".nav-links a").forEach((link) => {
      if (link.getAttribute("href") === `./${category.page}`) {
        link.setAttribute("aria-current", "page");
      }
    });
  }
})();
