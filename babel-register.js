/* eslint import/no-extraneous-dependencies: 0 */
require('object.entries/auto');

require('@babel/register')({
  sourceMaps: false,
  ignore: [/[\\/]node_modules[\\/](?!(eslint|eslint-scope|semver)[\\/])/i],
});
