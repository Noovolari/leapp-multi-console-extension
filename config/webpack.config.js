"use strict";

const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const PATHS = require("./paths");

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + "/frontend/popup.js",
      contentScript: PATHS.build + "/backend/contentScript.ts",
      background: PATHS.build + "/backend/background.ts",
    },
    devtool: argv.mode === "production" ? false : "source-map",
  });

module.exports = config;
