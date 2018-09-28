const path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');


module.exports = {
    entry: {
        app: ['./src/index.jsx', 'webpack-hot-middleware/client'],
        vendor: ['react', 'react-dom']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].bundle.js'
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ["@babel/preset-env", "@babel/preset-react"],
                    plugins: ["@babel/plugin-proposal-class-properties"]
                }
            },
            {
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader',
                options: { reportFiles: ['src/**/*.{ts,tsx}'] }
            },
            {
                test: /\.scss$/,
                loaders: ["style-loader", "css-loader", "sass-loader"],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader"],
                exclude: /node_modules/
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            query: {
                                name: '[sha512:hash:base64:7].[ext]'
                            }
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.svg$/,
                loader: 'babel-loader!svg-react-loader',
                include: path.join(__dirname, 'src')
            },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'src', 'index.html') }),
        new webpack.HotModuleReplacementPlugin(),
        new ForkTsCheckerWebpackPlugin()
    ]
}