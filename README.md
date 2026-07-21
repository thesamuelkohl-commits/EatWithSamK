# Eat With Sam K 🍔

Your food review site: an interactive map of every place you've rated, plus a blog for city food guides.

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
   - **video** — the share link to your Instagram review reel.
   - **id** — any unique short name, like `"lous-burgers-denver"`. This becomes the review's URL.
4. **Run the review-page generator** (see below) so the new place gets its own SEO-optimized page.
5. Refresh the site — the marker, card, stats, and full review page all update automatically.

Marker colors: green = 9.0+, orange = 8.0–8.9, gold = below 8.

## ⭐ Every review gets its own page (and is optimized for Google)

Each place in `js/data.js` gets a real, standalone page at `reviews/<id>.html` — e.g. `reviews/prince-street-pizza-nashville.html`. These aren't just template views: each one has its own unique page title, meta description, Open Graph/Twitter preview tags (so links look good when shared on social), and "Review" structured data that helps Google show star ratings directly in search results.

**Whenever you add, edit, or remove a place in `js/data.js`, run:**

```bash
cd "/Users/samkohl/Eat With Sam K"
node generate-reviews.js
```

This rebuilds every file in `reviews/`, plus `sitemap.xml` and `robots.txt`, from whatever is currently in `js/data.js`. (Requires Node.js, which is already installed if `node --version` works in your terminal.) You never hand-edit anything inside `reviews/` — it's fully regenerated each time.

**Before you go live**, open `generate-reviews.js` and update the `SITE_URL` constant near the top (currently a placeholder: `https://www.eatwithsamk.com`) to your real domain once you've deployed. It's used in canonical links, social preview tags, and the sitemap — all of which need your real, final domain to work correctly for SEO.

## Writing a blog post

Open `js/blog-data.js`, copy a post block to the top of the list, give it a unique `id`, and write your `content` using simple HTML tags (`<p>`, `<h2>`, `<ul>`, `<li>`, `<strong>`, `<a>`).

## ⚠️ Before you launch

- Confirm your social handles at the top of `js/data.js` (currently guessed as `@eatwithsamk`).
- Update `SITE_URL` in `generate-reviews.js` to your real domain (see above), then re-run the generator once more so every page's canonical/OG links point to the right place.

## Previewing locally

Open `index.html` in a browser, or run a tiny local server:

```bash
cd "/Users/samkohl/Eat With Sam K"
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Publishing (free options)

- **Netlify Drop** — drag the whole folder onto https://app.netlify.com/drop. Done.
- **GitHub Pages** — push this folder to a repo, enable Pages in settings.
- Works with any custom domain (e.g. eatwithsamk.com) via either host.

It's all static files — no server, no framework. The one exception is `generate-reviews.js`, a small Node script that builds the `reviews/` pages from `js/data.js` (see above); run it once before each deploy so the live site includes your latest reviews.
