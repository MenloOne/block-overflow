import cfg from './public'
import './network'

const {NODE_ENV} = process.env

const config = {

  default: {
    locales: ['en', 'ko', 'ja', 'zh']
  },

  development: {},

  staging: {},

  production: {}
}


export default config[NODE_ENV] ?
  {...cfg, ...config.default, ...config[NODE_ENV]} :
  {...cfg, ...config.default, ...config.development}
