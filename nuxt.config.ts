// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/style.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL,
    },
  },

  app: {
    head: {
      title: 'KDLouvor | Encontre o louvor certo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Encontre o louvor certo para cultos, células ou eventos. No KDLouvor você busca músicas por tema, como fé, adoração ou Jesus, e também pela dinâmica — calmas ou agitadas.' },
        { property: 'og:title', content: 'KDLouvor' },
        { property: 'og:description', content: 'Encontre o louvor ideal para cada ocasião — cultos, células, eventos ou momentos devocionais. No KDLouvor você busca músicas cristãs por tema, como fé, adoração e Jesus, ou por estilo, como calmas ou animadas.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://kdlouvor.com' },
        { property: 'og:image', content: 'https://kdlouvor.com/images/preview.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],
    },
  },
})
