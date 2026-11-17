// JS mirror of the CSS tokens in styles/index.css.
// Use these only where CSS classes can't reach (Leaflet, SVG, canvas, Framer Motion values).
export const color = {
  lace: '#FFFEF2', // the canvas
  card: '#FFFEF2',
  satin: '#B3A594', // stone
  espresso: '#252525', // charcoal ink
  cocoa: '#252525',
  ink: '#333333',
  linen: '#F6F5E8',
  linenDeep: '#ECEADD',
  line: '#DFDDD2',
  lineSoft: '#E6E4D9',
  lineStrong: '#D5D2C8',
  satinWash: '#F1EEE0',
  satinDeep: '#6B5F51',
  muted: '#5F5D56',
  faint: '#9A978C',
  terracotta: '#8F5A44',
  terracottaWash: '#F3E9DF',
  open: '#4B6450',
  openWash: '#ECEEE2',
  alert: '#9A3F2C',
  alertWash: '#F4E6DC',
} as const

export type ColorToken = keyof typeof color

// Chart series, validated with the dataviz palette checker against Old Lace
// (lightness band, chroma floor, colour-blind separation). Brand-family hues
// stepped just enough to pass: the raw brand browns read as grey in charts.
//   Order matters: roast and matcha must never touch (deutan ΔE 5.3);
//   caramel always sits between them. Caramel is 2.7:1 on lace, so charts
//   using it always carry visible labels and a table view.
export const chart = {
  roast: '#3A3833', // charcoal: single-series default
  caramel: '#A8987F', // stone
  matcha: '#64755A', // moss
  grid: '#E6E4D9',
  axis: '#5F5D56',
} as const

// Standard OpenStreetMap tiles: free and key-less, warmed by the `.bean-tiles` CSS filter.
// Labels are baked in, so there is no separate labels layer.
export const mapTiles = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
} as const
