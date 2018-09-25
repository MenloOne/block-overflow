var webpack = require('webpack');
var path = require('path');
var CommonsChunkPlugin = require("./node_modules/webpack/lib/optimize/CommonsChunkPlugin");


module.exports = {
    entry: {
        main: ['babel-polyfill', "./src/index.js"]
    },
    output: {
        path: path.join(__dirname, "public/bundle/"),
        publicPath: "/bundle/",
        filename: "[name].js"
    },
    resolve: {
        modules: ["node_modules", path.join(__dirname, "src")]
    },
    plugins: [
        new CommonsChunkPlugin({
            filename: "commons.js",
            name: "commons"
        }),
	    new webpack.EnvironmentPlugin(['NODE_ENV', 'DEBUG'])
    ],
    devtool: "sourcemap",
    devServer: {
        https: false,
        host: "portal.local",
        port: 8080,
        disableHostCheck: true,
        historyApiFallback: true
    },
    module: {
        loaders: [
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
                include: path.join(__dirname, 'src') },
        ]
    }
}
