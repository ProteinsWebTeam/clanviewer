/* eslint-disable */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (env = { dev: true }) => ({
  mode: env.dev ? "development" : "production",
  entry: env.dev
    ? path.resolve(__dirname, "examples", "index.ts")
    : path.resolve(__dirname, "lib", "index.ts"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "clanviewer.packed.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    env.dev
      ? new HtmlWebpackPlugin({
          template: "examples/index.template.html",
        })
      : null,
    new MiniCssExtractPlugin(),
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
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: [
          env.dev ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
    ],
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
});
