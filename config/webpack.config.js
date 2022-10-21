"use strict";
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const IMAGE_TYPES = /\.(png|jpe?g|gif|svg)$/i;
const PATHS = require("./paths");

module.exports = (env, argv) => ({
  entry: {
    popup: PATHS.src + "/frontend/popup.js",
    "content-script": PATHS.src + "/backend/content-script.ts",
    "background-script": PATHS.src + "/backend/background-script.ts",
  },
  output: {
    // the build folder to output bundles and assets in.
    path: PATHS.build,
    // the filename template for entry chunks
    filename: "[name].js",
  },
  devtool: argv.mode === "production" ? false : "source-map",
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  stats: {
    all: false,
    errors: true,
    builtAt: true,
    assets: true,
    excludeAssets: [IMAGE_TYPES],
  },
  module: {
    rules: [
      // Help webpack in understanding CSS files imported in .js files
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      // Check for images imported in .js files and
      {
        test: IMAGE_TYPES,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "images",
              name: "[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    // Copy static assets from `public` folder to `build` folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./manifest.json"
        },
        {
          from: "**/*",
          context: "asset"
        },
        {
          from: "**/*.html",
          context: "src/frontend",
        },
      ],
    }),
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
});
