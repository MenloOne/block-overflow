/* eslint import/first: 0 */

process.env.BABEL_ENV = 'browser'
process.env.NODE_ENV  = 'development'

import Koa from 'koa'
import debug from 'debug'
import webpack from 'webpack'
import convert from 'koa-convert'

const app = new Koa()
const compiler = webpack(config.webpack)

debug.enable('dev')

const HOST = 'localhost'
const PORT = process.env.PORT || 3000

const config = {
    port: PORT,
    options: {
        path: './dist',
        publicPath: `//${HOST}:${PORT}/assets/`,
        hot: true,
        stats: {
            assets: true,
            colors: true,
            version: false,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false
        }
    }
}

app.use(convert(require('koa-webpack-dev-middleware')(compiler, config)))
app.use(convert(require('koa-webpack-hot-middleware')(compiler)))

app.listen(config.server.port, '0.0.0.0', () =>
    debug('dev')('`webpack-dev-server` listening on port %s', config.port))
