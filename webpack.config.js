
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
var CommonsChunkPlugin = require("./node_modules/webpack/lib/optimize/CommonsChunkPlugin");
var webpack = require('webpack')

module.exports = {
    entry: {
        main: ['babel-polyfill', './src/index.tsx']
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        modules: ["node_modules", path.join(__dirname, "src")]
    },
    output: {
        path: path.join(__dirname, "public/bundle/"),
        publicPath: "/bundle/",
        filename: "[name].js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Block Overflow'
        }),
        new CommonsChunkPlugin({
            filename: "commons.js",
            name: "commons"
        }),
        new CopyWebpackPlugin([
            { from: 'public', to: './'}
        ]),
        /*
        new HtmlWebpackIncludeAssetsPlugin({
            jsExtensions: ['.js', 'js'],
            assets: ['https://www.googletagmanager.com/gtag/js?id=UA-119302324-1', 'ga.js', 'main.css', 'config.js'],
            append: false }),
        */
        new ForkTsCheckerWebpackPlugin(),
        new FaviconsWebpackPlugin('./public/favicon.png')
    ],
    performance: { hints: false }
    devtool: "sourcemap",
    devServer: {
        https: false,
        host: "portal.local",
        port: 8080,
        disableHostCheck: true,
        historyApiFallback: true,
        contentBase: path.resolve('public')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true //HMR doesn't work without this
                    }
                }
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel"
            },
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"], exclude: /node_modules/
            },
            {
                test: /\.css$/,
                include: /node_modules/,
                loaders: ['style-loader', 'css-loader'],
            },
            { test: /\.svg$/,
                loader: 'babel!react-svg',
                include: path.join(__dirname, 'src')
            },
        ]
    }
}
