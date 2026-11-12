import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aurelia Learn',
    short_name: 'Aurelia',
    description: 'English learning for children, from letters to conversations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDE7',
    theme_color: '#4FC3F7',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
