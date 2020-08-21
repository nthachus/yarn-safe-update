const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './index',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
  },
  context: __dirname,
  target: 'node',
  node: {
    __filename: false,
    __dirname: false,
  },
  module: {
    rules: [
      {
        // transpile ES6-8 into ES5
        test: /\.m?js$/,
        // exclude: /node_modules\b/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new CopyPlugin([
      '{LICENSE,*.md}',
      {
        from: 'package.json',
        transform(content, path) {
          return content
            .toString()
            .replace(/"(d(evD)?ependencies|scripts|eslintConfig)": \{.*?\},?\n/gs, '');
        },
      },
    ]),
  ],
  optimization: {
    nodeEnv: false,
    // minimize: false,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          mangle: false,
          output: { beautify: true },
        },
      }),
    ],
  },
};
