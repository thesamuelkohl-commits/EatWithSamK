/* Map page: the interactive map of every place rated, full-size, plus a
   minimum-rating slider. Shares its map logic with the homepage via
   initPlacesMap() in common.js. */

const { map, markers } = initPlacesMap("map", PLACES);

const slider = document.getElementById("rating-slider");
const sliderValue = document.getElementById("rating-slider-value");

function applyRatingFilter() {
  const min = parseFloat(slider.value);
  sliderValue.textContent = min <= 0 ? "Showing all (0+ / 10)" : `Showing ${min.toFixed(1)}+ / 10`;
  PLACES.forEach((place) => {
    const marker = markers[place.id];
    if (!marker) return;
    const shouldShow = place.rating >= min;
    const isShown = map.hasLayer(marker);
    if (shouldShow && !isShown) marker.addTo(map);
    if (!shouldShow && isShown) map.removeLayer(marker);
  });
}

slider.addEventListener("input", applyRatingFilter);
