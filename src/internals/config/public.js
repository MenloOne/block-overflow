const {BROWSER, NODE_ENV, PORT = 3000} = process.env

const port = parseInt(PORT, 10)
const config = {

  default: {
    apiURL: 'https://api.staging.menlo.one', // 'http://localhost:8088',
    port,
    locales: ['en', 'ko', 'ja', 'zh']
  },

  development: {},

  staging: {
    apiURL: 'http://api.staging.menlo.one'
  },

  production: {
    apiURL: 'https://api.menlo.one'
  },

  notbrowser: {}
}

if (BROWSER) {
  config.notbrowser = {}
}

export default config[NODE_ENV] ?
  {...config.default, ...config[NODE_ENV], ...config.nobrowser} :
  {...config.default, ...config.development, ...config.nobrowser}

