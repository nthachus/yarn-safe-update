const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const webpackConfig = (name, type = 'commonjs2') => ({
  mode: 'production',
  entry: `./${name}`,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `${name}.js`,
    libraryTarget: type,
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
  optimization: {
    nodeEnv: false,
    // minimize: false,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: { mangle: false, output: { beautify: true } },
      }),
    ],
  },
});

module.exports = [
  Object.assign(webpackConfig('index'), {
    externals: {
      'yarn/lib/cli': 'commonjs2 yarn/lib/cli',
    },
  }),
  Object.assign(webpackConfig('cli', 'var'), {
    externals: {
      './index': 'commonjs2 ./index',
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: '#!/usr/bin/env node\nrequire("v8-compile-cache");',
        raw: true,
      }),
      new CopyPlugin([
        '{LICENSE,*.md}',
        {
          from: 'package.json',
          transform(content) {
            return content
              .toString()
              .replace(/"scripts":.*$/s, '"dependencies": { "v8-compile-cache": "2" }\n}');
          },
        },
      ]),
    ],
  }),
];
