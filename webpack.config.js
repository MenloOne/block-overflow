const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name]-[hash].js',
        chunkFilename: '[name]-[hash].js',
        publicPath: '/assets/'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader'
                }
            },
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
                // Do not transform vendor's CSS with CSS-modules
                // The point is that they remain in global scope.
                // Since we require these CSS files in our JS or CSS files,
                // they will be a part of our compilation either way.
                // So, no need for ExtractTextPlugin here.
                test: /\.css$/,
                include: /node_modules/,
                use: ['style-loader', 'css-loader'],
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
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'dist', to: './'}
        ]),
        new HtmlWebpackPlugin({
            title: 'Block Overflow'
        }),
        new HtmlWebpackIncludeAssetsPlugin({
            jsExtensions: ['.js', 'js'],
            assets: ['main.css'],
            append: false }),
        new ForkTsCheckerWebpackPlugin(),
        new FaviconsWebpackPlugin('./public/favicon.png')
    ],
    devServer: {
        contentBase: path.resolve('dist')
    },
    performance: { hints: false }
};
