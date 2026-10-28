import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/wocoommerce-bulk-product-update/docs/',
  title: "Documentation for WooCommerce Bulk Product Update",
  description: "A VitePress Site",
  lastUpdated: true,
  sitemap: {
    hostname: 'https://sahajananddigital.github.io/wocoommerce-bulk-product-update/'
  },
  head: [
    ['meta', { name: 'keywords', content: 'woocommerce, bulk editor, product management, react, vite' }],
    ['meta', { property: 'og:title', content: 'WooCommerce Bulk Product Editor' }],
    ['meta', { property: 'og:description', content: 'Manage your WooCommerce products with a high-performance spreadsheet interface.' }],
    ['link', { rel: 'icon', href: '/wocoommerce-bulk-product-update/vite.svg' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Features', link: '/guide/features' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sahajananddigital/wocoommerce-bulk-product-update' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Sahajanand Digital'
    }
  }
})
