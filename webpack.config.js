const path = require('path');
const { BannerPlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const webpackConfig = (config) => {
  return Object.assign(config, {
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
          test: /\.m?js$/i,
          exclude: /node_modules.(invariant|strip-bom|safe-buffer|commander)\b/i,
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
          options: { search: ',\\s*"repository":[\\s\\S]*', flags: '', replace: '\n}' },
        },
        {
          test: /node_modules.semver.index\.js$/i,
          loader: 'string-replace-loader',
          options: {
            search: '^  (?!clean|satisfies|validRange|rsort|lte|[A-Z])\\w+: require',
            flags: 'gm',
            replace: '//$&',
          },
        },
        {
          test: /node_modules.@yarnpkg.lockfile.package\.json$/i,
          loader: 'string-replace-loader',
          options: { search: '[\\s\\S]*("yarnVersion":\\s*"[^"]*")[\\s\\S]*', flags: '', replace: '{ $1 }' },
        },
        {
          test: /node_modules.ssri.index\.js$/i,
          loader: 'string-replace-loader',
          options: { search: '^module\\.exports\\.(?!parse)(\\w+) = \\1\\w*;?$', flags: 'gm', replace: '// $&' },
        },
      ],
    },
    optimization: {
      nodeEnv: false,
      // minimize: false,
      minimizer: [
        new TerserPlugin({
          cache: true,
          // parallel: true,
          terserOptions: { mangle: false, output: { beautify: true, indent_level: 2 } },
        }),
      ],
    },
  });
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
      new BannerPlugin({
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
