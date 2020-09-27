const originalArgv = process.argv;
process.argv = [process.argv0, 'yarn', '-v'];
const { main: yarn } = require('yarn/lib/cli');

process.argv = originalArgv;
const { hookStdout } = require('./utils');

/**
 * @param {Array} results
 * @param {?string=} resultType
 * @return {*}
 */
const getYarnResult = (results, resultType = null) => {
  const result = results.find((r) => !resultType || r.type === resultType);
  return result && result.data;
};

/**
 * @param {string} command
 * @param {string[]} args
 * @param {?string=} resultType
 * @return {Promise}
 */
const yarnCli = async (command, args = [], resultType = 'inspect') => {
  args.unshift(command, '--json');

  const results = [];
  const unhookStdout = hookStdout(results);
  try {
    await yarn({ startArgs: [process.argv0, 'yarn'], args, endArgs: [] });
  } finally {
    unhookStdout();
  }

  return getYarnResult(results, resultType);
};

/**
 * @param {string} pkgName
 * @return {Promise<string[]>}
 */
const getPackageVersions = async (pkgName) => yarnCli('info', [pkgName, 'versions']);

/**
 * @param {string} pkgName
 * @param {?string=} version
 * @return {Promise<Object>}
 */
const getPackageInfo = async (pkgName, version = null) =>
  yarnCli('info', [version ? `${pkgName}@${version}` : pkgName]);

module.exports = {
  getYarnResult,
  yarnCli,
  getPackageVersions,
  getPackageInfo,
};
