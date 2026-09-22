// Single source of truth for business details and feature switches.
// Used by the build (HTML templating via {{key}}) and by the browser code.

export const SITE = {
  name: 'Putul Medical',
  // Public URL of the deployed site — used for canonical/OG tags, sitemap and robots.txt.
  url: 'https://profound-paletas-24c4ef.netlify.app',
  description:
    'Putul Medical, Katihar — genuine medicines, free home delivery, doctor bookings and home blood tests. Trusted since 1996.',
  since: 1996,

  phoneDisplay: '+91 79790 55763',
  phoneE164: '+917979055763',
  whatsapp: '917979055763', // wa.me format: country code + number, digits only

  addressLine: 'Binodpur, Katihar – 854105',
  addressLocality: 'Katihar',
  addressRegion: 'Bihar',
  postalCode: '854105',
  mapsUrl: 'https://maps.google.com/?q=Binodpur,+Katihar+854105',

  features: {
    // Record bookings, prescriptions and newsletter sign-ups with Netlify Forms.
    // When off (or when a submission fails) every flow falls back to WhatsApp.
    netlifyForms: true,
    newsletter: true,
    // Sign-in UI is a front-end mock with no backend — keep off until auth exists.
    signin: false,
    // Shows a simulated tracking timeline. Off in production: tracking goes to WhatsApp.
    demoTracking: false,
  },
};
