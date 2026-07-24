/* ============================================================
   EAT WITH SAM K — SITE DATA
   This is the ONLY file you need to edit to add a new place.
   Copy one of the blocks below, paste it at the top of the
   PLACES list, and fill in your info.
   Tip: to get lat/lng, right-click the spot on Google Maps and
   click the coordinates to copy them.
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
    id: "prince-street-pizza-nashville",
    name: "Prince St. Pizza",
    city: "Nashville, TN",
    lat: 36.160411,
    lng: -86.779725,
    address: "5056 Broadway, Suite B-103, Nashville, TN 37203",
    phone: "(629) 317-8644",
    website: "https://locations.princestreetpizza.com/nashville",
    date: "2026-07-20",
    badges: ["family-friendly"],
    about: "Prince St. Pizza traces back to 2012 in New York's Nolita neighborhood, built on recipes that have stayed in the Morano family for generations — their philosophy is simple: if it works on pasta, it works on pizza. The original NYC shop made its name on the Sicilian \"SoHo Square,\" a thick, crispy-bottomed slice, and the Spicy Spring, its signature square topped with pepperoni cups, fresh mozzarella, and tomato sauce. The brand has since expanded well beyond New York, and this location — inside the Fifth + Broadway development in downtown Nashville — is its first in Tennessee.",
    ate: "The Spicy Vodka, The Naughty Pie, and the Houston Jalapeno — three square slices, three very different heat levels.",
    rating: 7.4,
    video: "https://www.instagram.com/reel/Da-9uB3Ri5x/?igsh=bGx4YnhpZWZ4bG5r",
    tags: ["Pizza", "Downtown Nashville"],
  },
];
