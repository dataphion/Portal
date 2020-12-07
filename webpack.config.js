"use strict";

var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool: "eval-source-map",
  entry: [
    "babel-polyfill",
    "webpack-dev-server/client?http://localhost:3000",
    "webpack/hot/only-dev-server",
    "react-hot-loader/patch",
    path.join(__dirname, "app/index.js"),
  ],
  output: {
    path: path.join(__dirname, "/dist/"),
    filename: "[name].js",
    publicPath: "/",
  },
  devServer: {
    historyApiFallback: true,
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "app/index.tpl.html",
      inject: "body",
      filename: "index.html",
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel",
      },

      {
        test: /\.json?$/,
        loader: "json",
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
      },
      // {
      //   test: /\.s?css$/,
      //   loader: 'style-loader!css-loader!sass-loader',
      // },
      {
        test: /\.(png|jpg|jpeg|ttf|svg|gif)$/,
        loader: "url-loader?limit=8192",
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: "file?name=public/fonts/[name].[ext]",
      },
      {
        test: /\.scss$/,
        loader: "style!css?modules&localIdentName=[local]!sass",
      },
      {
        test: /\.(ico|mp4)$/,
        loader: "file-loader?name=[name].[ext]",
      },
      {
        test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/,
        loader: "url?limit=10000&mimetype=application/font-woff",
      },
      {
        test: /\.(ttf|eot)(\?[a-z0-9#=&.]+)?$/,
        loader: "file",
      },
    ],
    rules: [
      {
        test: /\.txt$/i,
        use: "raw-loader",
      },
    ],
  },
};
