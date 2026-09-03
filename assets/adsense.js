(function () {
  "use strict";

  const config = window.MLS_ADSENSE || {};
  const publisherId = String(config.publisherId || "").trim();

  /* Do not load an invalid or placeholder client ID. */
  if (!/^ca-pub-\d{16}$/.test(publisherId)) return;

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
  document.head.appendChild(script);
})();
