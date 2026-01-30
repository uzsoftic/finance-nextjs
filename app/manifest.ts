import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finance Manager',
    short_name: 'Finance',
    description: 'Personal money tracker – expenses, income, debts. Works offline.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a1a',
    theme_color: '#1a1f2e',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      { src: '/icon-light-32x32.png', type: 'image/png', sizes: '32x32', purpose: 'any' },
      { src: '/icon-dark-32x32.png', type: 'image/png', sizes: '32x32', purpose: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180', purpose: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
    ],
  };
}
