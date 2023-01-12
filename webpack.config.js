const path = require("path");
const webpack = require("webpack");
const {merge} = require("webpack-merge");
const CopyPlugin = require("copy-webpack-plugin");

// const __dirname = path.resolve();
let devtool = undefined;
let entrypoint = "./app.ts";
let outputfile = "saito.js";
if (process.argv.includes("dev")) {
    console.log("dev mode source map used");
    devtool = "eval";
}

let config = {
    optimization: {
        minimize: false,
    },
    // node: {
    //     fs: "empty",
    // },
    externals: [
        {
            archiver: "archiver"
        },
        {
            child_process: "child_process"
        },
        {
            nodemailer: "nodemailer"
        },
        {
            jimp: "jimp"
        },
        {
            "image-resolve": "image-resolver"
        },
        {
            sqlite: "sqlite"
        },
        {
            unzipper: "unzipper"
        },
        {
            webpack: "webpack"
        },
        // /^(image-resolver|\$)$/i,
        /\.txt/,
        /\.png$/,
        /\.jpg$/,
        /\.html$/,
        /\.css$/,
        /\.sql$/,
        /\.md$/,
        /\.pdf$/,
        /\.sh$/,
        /\.zip$/,
        /\/web\//,
        /\/www\//
    ],
    // Path to your entry point. From this file Webpack will begin his work
    // entry: ["babel-polyfill", path.resolve(__dirname, entrypoint)],
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
            "crypto-browserify": require.resolve("crypto-browserify"),
            "async_hooks": false,
            'process/browser': require.resolve('process/browser'),
            "util": require.resolve("util/")
        }
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /(node_modules)/
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                test: /\.js$/,
                use: [
                    "source-map-loader",
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            sourceMaps: true
                        }
                    }
                ],
                exclude: /(node_modules)/
            },
            {
                test: /\.mjs$/,
                exclude: /(node_modules)/,
                type: "javascript/auto"
            },
            {
                test: /html$/,
                exclude: [/(mods)/, /(email)/]
            },
            // {
            //     test: /\.js$/,
            //     exclude: /(node_modules)/,
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             presets: ['@babel/preset-env'],
            //             sourceMaps:true
            //         }
            //     }
            // },
            // Emscripten JS files define a global. With `exports-loader` we can
            // load these files correctly (provided the global’s name is the same
            // as the file name).
            {
                test: /quirc\.js$/,
                loader: "exports-loader"
            },
            // wasm files should not be processed but just be emitted and we want
            // to have their public URL.
            {
                test: /quirc\.wasm$/,
                type: "javascript/auto",
                loader: "file-loader",
                options: {
                    publicPath: "dist/"
                }
            },
            {
                test: /\.wasm$/,
                type: "asset/inline",
            },
            {
                test: /\.zip$/,
                exclude: [
                    path.resolve(__dirname, "../mods/appstore/bundler"),
                    path.resolve(__dirname, "../mods/appstore/mods")
                ]
            }
        ]
    },
    plugins: [
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"]
        }),
        new webpack.ProvidePlugin({
            process: "process/browser"
        })
    ],
    experiments: {
        asyncWebAssembly: true,
        topLevelAwait:true,
        syncWebAssembly: true,
        futureDefaults:true,
    },
    mode: "development",
    devtool: devtool

};

let nodeConfigs = merge(config, {
    output: {
        path: path.resolve(__dirname, "./dist/server"),
        filename: outputfile
    },
    target: "node",
    entry: ["babel-polyfill", path.resolve(__dirname, "./app.node.ts")],
});
let webConfigs = merge(config, {
    output: {
        path: path.resolve(__dirname, "./dist/browser"),
        filename: outputfile
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: "./dist/browser/saito.js",
                to: "../../public/javascripts/saito.js",
            }]
        })
    ],
    target: "web",
    entry: ["babel-polyfill", path.resolve(__dirname, "./app.web.ts")],
});

module.exports = [nodeConfigs, webConfigs];
