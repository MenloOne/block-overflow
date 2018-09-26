const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
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
        loader: "babel-loader",
        query: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-class-properties"]
        }
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
      { from: 'public', to: './'}
    ]),
    new HtmlWebpackPlugin({
      title: 'Eth Plot'
    }),
    new HtmlWebpackIncludeAssetsPlugin({
      jsExtensions: ['.js', 'js'],
      assets: ['https://www.googletagmanager.com/gtag/js?id=UA-119302324-1', 'ga.js', 'main.css', 'config.js'],
      append: false }),
    new ForkTsCheckerWebpackPlugin(),
    new FaviconsWebpackPlugin('./public/favicon.png')],
  devServer: {
    contentBase: path.resolve('public')
  },
  performance: { hints: false }
};
