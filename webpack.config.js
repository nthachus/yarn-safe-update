const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const webpackConfig = (config) => {
  const base = {
    mode: 'production',
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
        {
          test: path.resolve(__dirname, 'src/cli.js'),
          loader: 'string-replace-loader',
          options: { search: '^#!.*[\\r\\n]+', flags: '', replace: '' },
        },
        {
          test: path.resolve(__dirname, 'package.json'),
          loader: 'string-replace-loader',
          options: { search: ',\\s*"repository"[\\s\\S]*$', flags: '', replace: '\n}' },
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
  };

  return Object.assign(base, config);
};

// noinspection JSUnusedGlobalSymbols
module.exports = [
  webpackConfig({
    entry: { index: './src/index' },
    output: {
      libraryTarget: 'commonjs2',
    },
  }),
  webpackConfig({
    entry: { cli: './src/cli' },
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
          transform: (content) => {
            return String(content)
              .replace(/(":\s*")(.\/)?src\//g, '$1$2')
              .replace(/(\s*)"scripts":[\s\S]*$/, '$1"dependencies": {$1  "v8-compile-cache": "2"$1}\n}\n');
          },
        },
      ]),
    ],
  }),
];
