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
      <article class="category-banner">
        <div class="meta">
          <span>${entries.length} pages</span>
          <span>${category.title}</span>
        </div>
        <h3>${category.title}</h3>
        <p>${category.description}</p>
        <div class="pill-list">
          ${entries.slice(0, 5).map((entry) => `<span>${entry.title}</span>`).join("")}
        </div>
        <p style="margin-top:16px"><a class="button ghost" href="${categoryHref(category.page)}">Open ${category.title}</a></p>
      </article>
    `;
  }

  function renderAlgorithmCard(entry) {
    return `
      <article class="algorithm-card">
        <div class="meta">
          <span>${catalog.categories.find((category) => category.id === entry.category).title}</span>
          <span>${entry.engine}</span>
        </div>
        <h3>${entry.title}</h3>
        <p>${entry.summary}</p>
        <p style="margin-top:16px"><a class="button ghost" href="${algorithmHref(entry.id)}">Open page</a></p>
      </article>
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
          <span>${entries.length} algorithm pages</span>
          <span>${category.title}</span>
        </div>
        <h3>${category.title} Index</h3>
        <p>${category.description}</p>
      </article>
    `;
    algorithmsNode.innerHTML = entries.map(renderAlgorithmCard).join("");
    U.qsa(".nav-links a").forEach((link) => {
      if (link.getAttribute("href") === `./${category.page}`) {
        link.setAttribute("aria-current", "page");
      }
    });
  }
})();
