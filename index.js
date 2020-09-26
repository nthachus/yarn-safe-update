const lockfile = require('@yarnpkg/lockfile');
const semver = require('semver');

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
  yarnCli('info', [version ? `${pkgName}@${version}` : pkgName]);

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

    if (!packages[pkgName]) packages[pkgName] = {};
    let info = packages[pkgName];

    if (!info[pkg.version]) info[pkg.version] = { pkg, versions: [], updated: false };
    info = info[pkg.version];

    info.versions.push(version);
    if (!info.updated && version && semver.clean(version, true) === pkg.version) {
      info.updated = true;
    }
  });

  return packages;
};

const getObjectKeys = (obj) => obj && Object.keys(obj);

const isCompatibleDeps = async (newDeps, oldDeps) => {
  const newKeys = getObjectKeys(newDeps);
  if (!newKeys || !newKeys.length) return true;

  const oldKeys = getObjectKeys(oldDeps);
  if (!oldKeys || !oldKeys.length) return false;

  // TODO !
  newKeys.sort();
  oldKeys.sort();

  return newKeys === oldKeys;
};

const buildPackageData = (pkg) => ({
  version: pkg.version,
  resolved: `${pkg.dist.tarball.replace('.npmjs.org/', '.yarnpkg.com/')}#${pkg.dist.shasum}`,
  integrity: pkg.dist.integrity,
  dependencies: pkg.dependencies,
  optionalDependencies: pkg.optionalDependencies,
});

const updateAPackage = async (packages, name, version) => {
  const info = packages[name][version];
  if (info.updated) return;

  const versions = await getPackageVersions(name);
  semver.rsort(versions);
  // console.log('getPackageVersions', versions);

  // eslint-disable-next-line no-restricted-syntax
  for (const ver of versions) {
    if (ver === version) {
      info.updated = true;
      break;
    }

    if (info.versions.every((range) => semver.satisfies(ver, range))) {
      const pkg = await getPackageInfo(name, ver);
      if (
        (await isCompatibleDeps(pkg.optionalDependencies, info.pkg.optionalDependencies)) &&
        (await isCompatibleDeps(pkg.dependencies, info.pkg.dependencies))
      ) {
        info.pkg = buildPackageData(pkg);
        info.updated = ver;
        break;
      }
    }
  }
};

const applyUpdatedPackages = (packages, json) => {
  Object.keys(packages).forEach((name) => {
    Object.keys(packages[name]).forEach((version) => {
      const info = packages[name][version];
      if (typeof info.updated === 'string') {
        info.versions.forEach((range) => {
          // eslint-disable-next-line no-param-reassign
          json[range ? `${name}@${range}` : name] = info.pkg;
        });
      }
    });
  });
};

// TODO: level = 0
module.exports.updatePackages = async (yarnLock) => {
  const json = parseYarnLock(yarnLock);
  const packages = collectPackages(json);
  // console.log('collectPackages', packages);

  const tasks = [];
  Object.keys(packages).forEach((name) => {
    Object.keys(packages[name]).forEach((version) => {
      tasks.push(updateAPackage(packages, name, version));
    });
  });

  await Promise.all(tasks);
  applyUpdatedPackages(packages, json);

  return lockfile.stringify(json);
};
