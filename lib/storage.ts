export const BUCKETS = {
  venueAssets: 'venue-assets',   // public — venue cover images, floor plan images
  eventCovers: 'event-covers',   // public — event hero images
  seatMaps:    'seat-maps',      // private — Konva.js map JSON configs
  tickets:     'tickets',        // private — ticket PDFs / QR codes
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];
