/* Best Of guides index: search + city filter over BLOG_POSTS. */

const gridEl = document.getElementById("blog-grid");
const countEl = document.getElementById("blog-count");
const searchEl = document.getElementById("blog-search");
const cityEl = document.getElementById("filter-city");
const clearBtn = document.getElementById("filters-clear");

const cities = [...new Set(BLOG_POSTS.map((p) => p.city).filter(Boolean))].sort();
cityEl.innerHTML = `<option value="">All Cities</option>` + cities.map((c) => `<option value="${escapeForAttr(c)}">${c}</option>`).join("");

function filteredPosts() {
  const q = searchEl.value.trim().toLowerCase();
  return BLOG_POSTS.filter((p) => {
    const matchesQuery = !q || [p.title, p.city, p.excerpt].filter(Boolean).join(" ").toLowerCase().includes(q);
    const matchesCity = !cityEl.value || p.city === cityEl.value;
    return matchesQuery && matchesCity;
  });
}

function renderGrid() {
  const posts = filteredPosts();
  countEl.textContent = posts.length === BLOG_POSTS.length ? `${BLOG_POSTS.length} guide${BLOG_POSTS.length === 1 ? "" : "s"}` : `${posts.length} of ${BLOG_POSTS.length} guides`;
  gridEl.innerHTML = posts.length ? posts.map(blogCardHtml).join("") : `<p class="no-results">No guides match those filters, try clearing one. 👀</p>`;
}

searchEl.addEventListener("input", renderGrid);
cityEl.addEventListener("change", renderGrid);
clearBtn.addEventListener("click", () => {
  searchEl.value = "";
  cityEl.value = "";
  renderGrid();
});

renderGrid();
