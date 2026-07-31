/* ============================================================
   EAT WITH SAM K — SITE DATA
   This is the ONLY file you need to edit to add a new place.
   Copy one of the blocks below, paste it at the top of the
   PLACES list, and fill in your info.
   Tip: to get lat/lng, right-click the spot on Google Maps and
   click the coordinates to copy them.

   Optional review-template fields (see README for the full list):
   price ("$".."$$$$" — hover shows the price guide automatically),
   cuisine, quickTake, photos [{src, alt}], scores {taste,value,
   atmosphere,service}, pros [...], cons [...]. Leave any of them
   out and that section of the review page just won't appear.
   ============================================================ */

const SITE = {
  name: "Eat With Sam K",
  tagline: "Good Food. Real Reviews. Good Times.",
  socials: {
    instagram: "https://www.instagram.com/eatwithsamk",
    tiktok: "https://www.tiktok.com/@eatwithsamk",
    youtube: "https://www.youtube.com/@eatwithsamk",
  },
};

/* ---------- Price Guide ----------
   Shown as a hover tooltip on every "$" price tag site-wide — no
   visible legend/table anywhere, just hover to see what it means. */
const PRICE_GUIDE = {
  $: { range: "Under $15", description: "Budget-friendly, fast casual, food trucks, quick bites" },
  "$$": { range: "$15–30", description: "Casual dining, local favorites, most restaurants" },
  "$$$": { range: "$30–60", description: "Upscale dining, steakhouses, nicer date nights" },
  "$$$$": { range: "$60+", description: "Luxury dining, tasting menus, premium steakhouses, special occasions" },
};

/* ---------- Badges ----------
   To tag a place, add a `badges: ["key", "key"]` array to it (see
   PLACES below). Only add a badge when it's genuinely true — these
   are meant to mean something, not decorate every card. */
const BADGES = {
  favorite: { emoji: "🏆", label: "Sam's Favorite", description: "One of the best restaurants I've ever visited." },
  "hidden-gem": { emoji: "💎", label: "Hidden Gem", description: "Exceptional food that deserves more attention." },
  "best-value": { emoji: "💰", label: "Best Value", description: "Outstanding quality for the price." },
  "date-night": { emoji: "❤️", label: "Date Night Pick", description: "Perfect atmosphere for a romantic dinner." },
  "family-friendly": { emoji: "👨‍👩‍👧", label: "Family Friendly", description: "Great for families, large groups, and kids." },
  "dog-friendly": { emoji: "🐶", label: "Dog Friendly", description: "Pet-friendly patio, welcoming staff, and a great place to bring your pup." },
  "worth-the-wait": { emoji: "🔥", label: "Worth the Wait", description: "Busy, but absolutely worth standing in line for." },
  "best-patio": { emoji: "🌅", label: "Best Patio", description: "One of the best outdoor dining experiences." },
  "best-drinks": { emoji: "🍹", label: "Best Drinks", description: "Excellent cocktails, mocktails, or beverage program." },
  "brunch-favorite": { emoji: "🍳", label: "Brunch Favorite", description: "One of the top brunch destinations." },
  "group-friendly": { emoji: "🎉", label: "Group Friendly", description: "Ideal for birthdays, celebrations, or large parties." },
  "work-friendly": { emoji: "💻", label: "Work Friendly", description: "Great Wi-Fi, coffee, and atmosphere for remote work." },
  "vegetarian-friendly": { emoji: "🌱", label: "Vegetarian Friendly", description: "Excellent vegetarian and vegan options." },
  "easy-parking": { emoji: "🚗", label: "Easy Parking", description: "Plenty of convenient parking nearby." },
  "quick-bite": { emoji: "⚡", label: "Quick Bite", description: "Great food with fast service when you're in a hurry." },
};

const PLACES = [
  {
    id: "nadc-burger-nashville",
    name: "NADC Burger",
    city: "Nashville, TN",
    lat: 36.16417,
    lng: -86.78,
    address: "10 The Arcade, Ste. 10, Nashville, TN 37219",
    website: "https://www.nadcburger.com/locations",
    date: "2026-07-29",
    price: "$$",
    cuisine: "Burgers",
    badges: ["quick-bite"],
    about: "NADC, short for \"Not A Damn Chance,\" is a single-item burger concept with a Nashville outpost tucked inside the historic Arcade downtown. True to its stripped-down format, there's just one burger on the menu: two smashed 3 oz patties of 100% Wagyu beef, American cheese, a tangy secret sauce, onions, pickles, and jalapeños on a griddled bun, backed up by a short drink list and a brown-butter chocolate chip cookie for dessert.",
    ate: "NADC Burger with everything, a side of fries, and their secret sauce.",
    photos: [
      { src: "images/reviews/nadc-burger-nashville/storefront.jpg", alt: "NADC Burger storefront inside The Arcade, downtown Nashville" },
      { src: "images/reviews/nadc-burger-nashville/order.jpg", alt: "Sam's order: the NADC Burger with everything and a side of fries" },
      { src: "images/reviews/nadc-burger-nashville/closeup.jpg", alt: "Close-up of the NADC Burger, cheese and pickled jalapenos" },
    ],
    // scores: { taste: 8, value: 8, atmosphere: 6, service: 7 }, // TODO: Sam — fill in your 0-10 breakdown and this section will appear automatically.
    pros: ["Quick", "Cool area of town"],
    cons: ["No seating inside"],
    rating: 8.2,
    video: "https://www.instagram.com/reel/Dbb0-Tct6r6/?igsh=Nmg2NmxnaHdvdTdx",
    tags: ["Burgers", "Downtown Nashville"],
  },
  {
    id: "prince-street-pizza-nashville",
    name: "Prince St. Pizza",
    city: "Nashville, TN",
    lat: 36.160411,
    lng: -86.779725,
    address: "5056 Broadway, Suite B-103, Nashville, TN 37203",
    phone: "(629) 317-8644",
    website: "https://locations.princestreetpizza.com/nashville",
    date: "2026-07-18",
    price: "$$",
    cuisine: "Pizza",
    badges: ["family-friendly"],
    about: "Prince St. Pizza traces back to 2012 in New York's Nolita neighborhood, built on recipes that have stayed in the Morano family for generations, their philosophy is simple: if it works on pasta, it works on pizza. The original NYC shop made its name on the Sicilian \"SoHo Square,\" a thick, crispy-bottomed slice, and the Spicy Spring, its signature square topped with pepperoni cups, fresh mozzarella, and tomato sauce. The brand has since expanded well beyond New York, and this location, inside the Fifth + Broadway development in downtown Nashville, is its first in Tennessee.",
    quickTake: "A solid, no-frills square slice with real New York pedigree, the Spicy Vodka and Naughty Pie both deliver plenty of flavor. It doesn't quite live up to the legendary hype of the original Nolita shop, but it's a dependable, affordable stop if you're downtown and want a genuinely good slice fast.",
    ate: "The Spicy Vodka, The Naughty Pie, and the Houston Jalapeno, three square slices, three very different heat levels.",
    photos: [
      { src: "images/reviews/prince-street-pizza-nashville/storefront.jpg", alt: "Prince St. Pizza storefront and patio seating, Fifth + Broadway, Nashville" },
      { src: "images/reviews/prince-street-pizza-nashville/display-case.jpg", alt: "Prince St. Pizza's display case with fresh square slices, Nashville" },
      { src: "images/reviews/prince-street-pizza-nashville/order.jpg", alt: "Sam's order: three square slices in the box, Prince St. Pizza Nashville" },
      { src: "images/reviews/prince-street-pizza-nashville/holding-box.jpg", alt: "Sam holding a Prince St. Pizza box, home of the spicy pepperoni" },
    ],
    // scores: { taste: 8, value: 8, atmosphere: 6, service: 7 }, // TODO: Sam — fill in your 0-10 breakdown and this section will appear automatically.
    pros: ["Quick", "Not super expensive", "Lots of options", "Close to Broadway"],
    cons: ["Small seating area", "Not 100% fresh unless you order a whole pie"],
    rating: 7.4,
    video: "https://www.instagram.com/reel/Da-9uB3Ri5x/?igsh=bGx4YnhpZWZ4bG5r",
    tags: ["Pizza", "Downtown Nashville"],
  },
];
