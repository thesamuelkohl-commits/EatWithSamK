# Eat With Sam K 🍔

Your food review site: an interactive map of every place you've rated, plus a blog for city food guides.

## The three things you'll edit

| What you want to do | File to edit |
|---|---|
| Add / edit a restaurant review | `js/data.js` |
| Write a blog post | `js/blog-data.js` |
| Update your social media links | `js/data.js` (top, under `SITE.socials`) |

You never need to touch the HTML, CSS, or `app.js`.

## Adding a new place

1. Open `js/data.js`.
2. Copy any existing block between `{ ... },` and paste it at the top of the `PLACES` list.
3. Fill in the fields:
   - **lat / lng** — right-click the spot in Google Maps, then click the coordinates to copy them.
   - **ate** — a sentence or two about what you ordered.
   - **rating** — your score out of 10 (decimals fine, e.g. `8.7`).
   - **video** — the share link to your Instagram review reel.
   - **id** — any unique short name, like `"lous-burgers-denver"`.
4. Save. Refresh the site — the marker, card, and stats update automatically.

Marker colors: green = 9.0+, red = 8.0–8.9, gold = below 8.

## Writing a blog post

Open `js/blog-data.js`, copy a post block to the top of the list, give it a unique `id`, and write your `content` using simple HTML tags (`<p>`, `<h2>`, `<ul>`, `<li>`, `<strong>`, `<a>`).

## ⚠️ Before you launch

The sample data uses **placeholder content**:
- The 6 restaurants are examples — replace them with your real reviews.
- The Instagram video links are fake (`EXAMPLE1`, etc.) — swap in your real reel links.
- Confirm your social handles at the top of `js/data.js` (currently guessed as `@eatwithsamk`).

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

No build step, no dependencies to install — it's all static files.
