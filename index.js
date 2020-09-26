const lockfile = require('@yarnpkg/lockfile');
const semverCoerce = require('semver/functions/coerce');

process.argv = [process.argv0, 'yarn', '-v'];
const { main: yarn } = require('yarn/lib/cli');

process.argv.pop();
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
    await yarn({ startArgs: process.argv, args, endArgs: [] });
  } finally {
    process.stdout.write = originalStdoutWrite;
  }

  return getYarnResult(results, resultType);
};

const getPackageVersions = async (pkgName) => yarnCli('info', [pkgName, 'versions']);

const getPackageInfo = async (pkgName, version = null) =>
  yarnCli('info', [version ? `${pkgName}@${semverCoerce(version)}` : pkgName]);

const parseYarnLock = (content) => lockfile.parse(content).object;

const parsePackageName = (name) => {
  const i = name.lastIndexOf('@');
  return i > 0 ? [name.substr(0, i), name.substr(i + 1)] : [name, null];
};

const collectPackages = (json) => {
  const packages = {};

  Object.keys(json).forEach((name) => {
    const pkg = json[name];
    const [pkgName, version] = parsePackageName(name);

    const key = `${pkgName}@${pkg.version}`;
    if (packages[key]) {
      packages[key].versions.push(version);
    } else {
      packages[key] = { name: pkgName, pkg, versions: [version] };
    }
  });

  return packages;
};

// TODO: level = 0
module.exports.updatePackages = async (yarnLock) => {
  const json = parseYarnLock(yarnLock);
  // console.log('parseYarnLock', json);
  const packages = collectPackages(json);
  console.log('collectPackages', packages);

  console.log('getPackageVersions', await getPackageVersions('semver'));
  console.log('getPackageInfo', await getPackageInfo('yarn', '1.22.4'));

  return lockfile.stringify(json);
};
