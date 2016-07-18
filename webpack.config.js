"use strict";

const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    context: path.resolve("./src"),

    entry: {
        vendor: [ "jquery", "perfect-scrollbar/jquery" ],
        nm: [ "./nm/index.js", "./nm/resource/index.less" ]
    },

    output: {
        path: path.resolve("./assets"),
        publicPath: "/assets", // "/" cann't be removed
        filename: "[name]/bundle.js"
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            }
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            "$": "jquery",
            "jQuery": "jquery",
            "perfectScrollbar": "perfect-scrollbar/jquery"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            filename: "vendor.js",
            minChunks: Infinity
        }),
        new ExtractTextPlugin("./[name]/resource/bundle.css")
    ],

    devServer: {
        proxy: {
            "/api/*": {
                target: "http://music.163.com/",
                host: "music.163.com",
                secure: false,
                headers: {
                    "Referer": "http://music.163.com"
                }
            }
        }
    }
};
