const lockfile = require('@yarnpkg/lockfile');
const semver = require('semver');

process.argv = [process.argv0, 'yarn', '-v'];
const { main: yarn } = require('yarn/lib/cli');

const originalStdoutWrite = process.stdout.write;

const hookStdout = (results) => {
  return (data, ...args) => {
    if (/^\{"type":".*?".*\}\s*$/.test(data)) {
      results.push(JSON.parse(data));
    } else {
      originalStdoutWrite.call(process.stdout, data, ...args);
    }
  };
};

const getYarnResult = (results, resultType = null) => {
  // console.log('getYarnResult', results);
  const result = results.find((r) => !resultType || r.type === resultType);
  return result && result.data;
};

const yarnCli = async (command, args = [], resultType = 'inspect') => {
  const results = [];
  process.stdout.write = hookStdout(results);

  try {
    args.unshift(command, '--json');
    await yarn({ startArgs: process.argv.slice(0, 2), args, endArgs: [] });
  } finally {
    process.stdout.write = originalStdoutWrite;
  }

  return getYarnResult(results, resultType);
};

const parseYarnLock = (content) => lockfile.parse(content).object;

const getPackageVersions = async (pkgName) => yarnCli('info', [pkgName, 'versions']);

const getPackageInfo = async (pkgName, version = null) =>
  yarnCli('info', [version ? `${pkgName}@${semver.coerce(version)}` : pkgName]);

// TODO: level = 0
module.exports.updatePackages = async (yarnLock) => {
  const json = parseYarnLock(yarnLock);
  console.log('parseYarnLock', json);

  console.log('getPackageVersions', await getPackageVersions('semver'));
  console.log('getPackageInfo', await getPackageInfo('yarn', '1.22.4'));

  return lockfile.stringify(json);
};
