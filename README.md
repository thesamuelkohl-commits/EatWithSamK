# Eat With Sam K 🍔

Your food review site: an interactive map of every place you've rated, plus a blog for city food guides.

## Pages

| Page | What's on it |
|---|---|
| `index.html` (Home) | Map of every place + your **Recent Reviews** (latest 6) + **From the Blog** (latest 3 posts) |
| `reviews.html` | **All** reviews — searchable, sortable, full list |
| `reviews/<id>.html` | One SEO-optimized landing page per place (auto-generated) |
| `blog.html` / `post.html` | Your city guides and food blog posts |

## The three things you'll edit

| What you want to do | File to edit |
|---|---|
| Add / edit a restaurant review | `js/data.js` |
| Write a blog post | `js/blog-data.js` |
| Update your social media links | `js/data.js` (top, under `SITE.socials`) |

You never need to touch the HTML or CSS.

## Adding a new place

1. Open `js/data.js`.
2. Copy any existing block between `{ ... },` and paste it at the top of the `PLACES` list.
3. Fill in the fields:
   - **lat / lng** — right-click the spot in Google Maps, then click the coordinates to copy them.
   - **ate** — a sentence or two about what you ordered (this is your personal take).
   - **about** *(optional)* — a factual paragraph on the place itself: origin story, what they're known for, what they serve. This shows in an "About" section on the review page, above your review. Leave it out and that section just won't appear.
   - **rating** — your score out of 10 (decimals fine, e.g. `8.7`).
   - **video** — the share link to your Instagram review reel. This also gets embedded directly on the review page (playable, with likes/comments) — no separate photo upload needed.
   - **date** *(optional)* — `"YYYY-MM-DD"`, the day you reviewed it. Controls what counts as "recent" on the homepage and the default sort on the Reviews page. Skip it and the place just falls back to its position in the list (newest pasted at the top = most recent).
   - **badges** *(optional)* — an array of badge keys, e.g. `badges: ["family-friendly", "date-night"]`. Shows as gold pills on the card and review page. See the full badge list below — only add one when it's genuinely true, not on every place.
   - **id** — any unique short name, like `"lous-burgers-denver"`. This becomes the review's URL.
4. **Run the review-page generator** (see below) so the new place gets its own SEO-optimized page.
5. Refresh the site — the marker, homepage's Recent Reviews, the full Reviews page, stats, and the dedicated review page all update automatically.

Marker colors: green = 9.0+, orange = 8.0–8.9, gold = below 8.

## Badges

Defined once in `js/data.js` (`const BADGES = {...}`) and referenced by key from any place's `badges: [...]` array. Available keys:

| Key | Badge |
|---|---|
| `favorite` | 🏆 Sam's Favorite |
| `hidden-gem` | 💎 Hidden Gem |
| `best-value` | 💰 Best Value |
| `date-night` | ❤️ Date Night Pick |
| `family-friendly` | 👨‍👩‍👧 Family Friendly |
| `dog-friendly` | 🐶 Dog Friendly |
| `worth-the-wait` | 🔥 Worth the Wait |
| `best-patio` | 🌅 Best Patio |
| `best-drinks` | 🍹 Best Drinks |
| `brunch-favorite` | 🍳 Brunch Favorite |
| `group-friendly` | 🎉 Group Friendly |
| `work-friendly` | 💻 Work Friendly |
| `vegetarian-friendly` | 🌱 Vegetarian Friendly |
| `easy-parking` | 🚗 Easy Parking |
| `quick-bite` | ⚡ Quick Bite |

Want a new badge? Add an entry to `BADGES` in `js/data.js` (emoji, label, description) and it's immediately usable everywhere.

**On Prince St. Pizza:** I only added `family-friendly` — it's a genuinely fast-casual, walk-up-and-order pizza-by-the-slice concept, which fits cleanly. I held off on the others based on what I could verify: it's a well-known, buzzy NYC chain (not really a "hidden gem"), a 7.4 rating doesn't support "Sam's Favorite," it's counter-service rather than a sit-down atmosphere (not really "date night"), and I couldn't confirm a dog policy, actual wait times at this specific location, or a clear value comparison. There is a confirmed ~300 sq ft patio, so `best-patio` is a reasonable candidate once you've actually experienced it — that one's your call.

## Photos & video

Every review page shows the actual Instagram reel you filmed there, embedded and playable — pulled straight from the `video` link already in `js/data.js`, so there's nothing extra to upload. It's your own content, so there's no copyright concern.

For restaurants you write about but haven't personally photographed (like a multi-restaurant blog roundup), the same approach applies: embed the restaurant's *own* official Instagram post rather than downloading and rehosting a photo from Google, Yelp, or their website. Grabbing someone else's photo and hosting it directly on a site that runs ads is a real copyright risk, not just a technicality — embedding keeps the image on Instagram's servers with full attribution to whoever posted it, which is the legally clean way to do this.

## ⭐ Every review gets its own page (and is optimized for Google)

Each place in `js/data.js` gets a real, standalone page at `reviews/<id>.html` — e.g. `reviews/prince-street-pizza-nashville.html`. These aren't just template views: each one has its own unique page title, meta description, Open Graph/Twitter preview tags (so links look good when shared on social), and "Review" structured data that helps Google show star ratings directly in search results.

**Whenever you add, edit, or remove a place in `js/data.js`, run:**

```bash
cd "/Users/samkohl/Sam's Personal/Eat With Sam K"
node generate-reviews.js
```

This rebuilds every file in `reviews/`, plus `sitemap.xml` and `robots.txt`, from whatever is currently in `js/data.js`. (Requires Node.js, which is already installed if `node --version` works in your terminal.) You never hand-edit anything inside `reviews/` — it's fully regenerated each time.

**Before you go live**, open `generate-reviews.js` and update the `SITE_URL` constant near the top (currently a placeholder: `https://www.eatwithsamk.com`) to your real domain once you've deployed. It's used in canonical links, social preview tags, and the sitemap — all of which need your real, final domain to work correctly for SEO.

## Analytics & Ads

Google Analytics (`G-2V4D6ZQV6Q`) and Google AdSense (`ca-pub-7072826210873110`) are both wired into every page: `index.html`, `reviews.html`, `blog.html`, `post.html`, and the `generate-reviews.js` template (so every generated `reviews/<id>.html` page gets them too). You don't need to touch these — they're already live.

**On ads:** the script we added enables **Auto ads** — once you turn that on in your AdSense account (Ads → Overview → Auto ads, toggle "On" for this site), Google automatically places ad units in good spots across every page with no further code changes. If you'd rather control exact placement yourself (e.g. an ad between the review and the map on `reviews/<id>.html`), come back and ask — that needs a real ad-unit slot ID from your AdSense dashboard first.

## Motion & animation

The whole site shares one small motion system in `js/common.js`, so you don't need to add anything per-page:

- **Scroll reveal** — any element with `class="reveal"` fades and slides in once it scrolls into view (cards, section headers, the review page's About/Instagram sections). Add the class to new markup and it just works — a `MutationObserver` picks up cards rendered dynamically too.
- **Count-up stats** — the homepage's "Places Rated / Cities / Avg Rating" numbers animate up from 0 the first time they scroll into view.
- **Header shadow on scroll**, a **logo wiggle** on hover, a slow ambient drift on the homepage's hero background, a soft pulse on 9.0+ rating badges, and smoother hover/press motion on buttons and cards.
- Respects `prefers-reduced-motion` — all of this is disabled for users who've asked their OS to reduce motion.

If a scroll-reveal or count-up ever seems stuck (a slow connection, an odd embedded browser), there's a 2-second safety-net fallback that reveals everything regardless — content is never permanently stuck invisible.

## Other SEO groundwork already in place

- **`sitemap.xml` + `robots.txt`** — regenerated automatically every time you run `node generate-reviews.js`, listing every page so Google can find them.
- **Structured data (JSON-LD)** on every page type: `WebSite` + `Organization` (with links to your Instagram/TikTok/YouTube) on the homepage, `Restaurant` + `Review` + `BreadcrumbList` on each review page, `ItemList` on the Reviews page, `BlogPosting` on each post.
- **Canonical URLs, Open Graph, and Twitter Card tags** on every page, so links look right when shared and Google doesn't see duplicate content.
- **One clear heading (`<h1>`) per page** and a breadcrumb trail (Home → Reviews → [Place]) for both users and Google.
- **FAQ structured data (`FAQPage`)** — if a blog post has a `faq` array (see below), those questions can show up as an expandable rich result directly in Google search, above your regular listing.

Idea for later: swapping AdSense's Auto ads for a couple of hand-placed in-content units once you know which spots perform best.

### Adding an FAQ to a blog post

Add a `faq` array to any post in `js/blog-data.js`:

```js
faq: [
  { question: "Your question here?", answer: "The answer, in plain text." },
],
```

This shows no visible FAQ section by itself — it only feeds Google's structured data. If you want the FAQ visible on the page too, write it into `content` as regular `<h2>`/`<p>` (like the Nashville date-night guide does), and keep the `faq` array in sync with it — Google requires structured data to match what's actually on the page.

## Writing a blog post

Open `js/blog-data.js`, copy a post block to the top of the list, give it a unique `id`, and write your `content` using simple HTML tags (`<p>`, `<h2>`, `<ul>`, `<li>`, `<strong>`, `<a>`).

## ⚠️ Before you launch

- Confirm your social handles at the top of `js/data.js` (currently guessed as `@eatwithsamk`).
- Update `SITE_URL` in `generate-reviews.js` to your real domain (see above), then re-run the generator once more so every page's canonical/OG links point to the right place.

## Previewing locally

Open `index.html` in a browser, or run a tiny local server:

```bash
cd "/Users/samkohl/Sam's Personal/Eat With Sam K"
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Publishing (free options)

- **Netlify Drop** — drag the whole folder onto https://app.netlify.com/drop. Done.
- **GitHub Pages** — push this folder to a repo, enable Pages in settings.
- Works with any custom domain (e.g. eatwithsamk.com) via either host.

It's all static files — no server, no framework. The one exception is `generate-reviews.js`, a small Node script that builds the `reviews/` pages from `js/data.js` (see above); run it once before each deploy so the live site includes your latest reviews.
