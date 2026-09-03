# Google AdSense setup

The site is wired for AdSense Auto ads, but it is intentionally disabled until
your real publisher ID is added.

1. In AdSense, add and verify `https://www.learnvisually.fun/`.
2. Open `assets/adsense-config.js` and set `publisherId` to the ID shown in
   AdSense, in the form `ca-pub-1234567890123456`.
3. Replace `pub-0000000000000000` in `ads.txt` with the numeric part of that
   same publisher ID. Keep the line format unchanged.
4. Deploy the site and confirm that these URLs are publicly reachable:
   - `https://www.learnvisually.fun/ads.txt`
   - `https://www.learnvisually.fun/`
5. In AdSense, enable Auto ads for the site and complete Google's review.

The integration is included in the home page, category pages, and interactive
algorithm page. Ads may not appear immediately after deployment while Google
reviews the site and updates ad serving.

Do not click your own ads or ask anyone else to click them. Ad placement and
content remain controlled by AdSense.
