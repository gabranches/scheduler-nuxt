const pkg = require('./package')

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: 'Game Changer Scheduler',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      // {
      //   rel: 'stylesheet',
      //   href: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.3/leaflet.css'
      // }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [],
  
  /*
  ** Plugins to load before mounting the App
  */
  // plugins: [{ src: '~/plugins/vue-leaflet', ssr: false }],

  serverMiddleware: ['~/server/api/index', '~/server/verify/index'],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // Doc: https://bootstrap-vue.js.org/docs/
    'bootstrap-vue/nuxt',
    // 'nuxt-leaflet'
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    // vendor: ['leaflet'],
    /*
    ** You can extend webpack config here
    */
    // devtools: true,
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        ;(config.devtool = '#source-map'),
          config.module.rules.push({
            enforce: 'pre',
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            exclude: /(node_modules)/,
            options: {
              fix: true
            }
          })
      }
    }
  }
}
