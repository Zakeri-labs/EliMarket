import L from "leaflet";

/**
 * Leaflet's default marker loads its PNGs by a CSS-relative URL, which the
 * bundler breaks — the pin never shows. This inline-SVG icon has no files to load.
 */
export const mapPinIcon = L.divIcon({
  className: "",
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))"><path d="M15 1C7.3 1 1 7.2 1 14.9 1 25 15 39 15 39s14-14 14-24.100C29 7.200 22.700 1 15 1z" fill="#f1e2c6" stroke="#1a1408" stroke-width="2"/><circle cx="15" cy="15" r="5" fill="#1a1408"/></svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 39],
});
