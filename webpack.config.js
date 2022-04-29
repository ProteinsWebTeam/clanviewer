/* eslint-disable */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env = { dev: true }) => ({
  mode: env.dev ? "development" : "production",
  entry: env.dev
    ? path.resolve(__dirname, "examples", "index.js")
    : path.resolve(__dirname, "lib", "index.js"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "clanviewer.packed.js",
  },
  plugins: [
    env.dev
      ? new HtmlWebpackPlugin({
          template: "examples/index.template.html",
        })
      : null,
  ].filter(Boolean),
  devtool: env.dev ? "inline-source-map" : "source-map",
  devServer: env.dev
    ? {
        hot: true,
        port: 8181,
      }
    : undefined,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
