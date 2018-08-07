/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env = { dev: true }) => ({
        mode: env.dev ? 'development' : 'production',
        entry: env.dev
            ? path.resolve(__dirname, 'examples', 'index.js')
            : path.resolve(__dirname, 'lib', 'index.js'),
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'clanviewer.packed.js'
        },
        plugins: [
            env.dev ? null : new webpack.optimize.ModuleConcatenationPlugin(),
            env.dev ? new webpack.HotModuleReplacementPlugin() : null,
            env.dev
                ? new HtmlWebpackPlugin({
                    template: path.join(__dirname, 'examples', 'index.template.html'),
                })
                : null,
        ].filter(Boolean),
        devtool: env.dev ? 'inline-source-map' : 'source-map',
        devServer: env.dev ? {
            overlay: true,
            hot: true,
            port: 8181,
            watchOptions: {
                ignored: /node_modules/,
            },
        } : undefined,
        module: {
            rules: [
                { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
            ]
        }
    });