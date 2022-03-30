const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    entry: "./app.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        //extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "path": require.resolve("path-browserify"),
            "zlib": false,
            "http": false,
            "https": false,
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer"),
            "crypto": require.resolve("crypto-browserify"),
            "crypto-browserify": require.resolve("crypto-browserify")
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"]
        }),
        new webpack.ProvidePlugin({
            process: "process/browser"
        }),
        new HtmlWebpackPlugin(),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, ".")
        }),
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /(node_modules)/
        }]
    },
    experiments: {
        asyncWebAssembly: true
    },
    mode: "development"
};
