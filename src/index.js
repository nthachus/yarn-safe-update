const lockFile = require('@yarnpkg/lockfile');
const semver = require('semver');

const { getPackageVersions, getPackageInfo } = require('./yarn-api');
const { parsePackageName, getObjectKeys, getYarnPackageMeta } = require('./utils');

const collectPackages = (json) => {
  const packages = {};

  Object.keys(json).forEach((name) => {
    const pkg = json[name];
    const [pkgName, version] = parsePackageName(name);

    if (!packages[pkgName]) packages[pkgName] = {};
    let obj = packages[pkgName];

    if (!obj[pkg.version]) obj[pkg.version] = { pkg, versions: [], updated: false };
    obj = obj[pkg.version];

    obj.versions.push(version);
    if (!obj.updated && version && semver.clean(version, true) === pkg.version) {
      obj.updated = true;
    }
  });

  return packages;
};

const selectUpdates = (packages) => {
  const json = {};

  Object.keys(packages).forEach((name) => {
    Object.keys(packages[name]).forEach((version) => {
      const obj = packages[name][version];
      if (typeof obj.updated === 'string') {
        obj.versions.forEach((range) => {
          json[typeof range === 'string' ? `${name}@${range}` : name] = obj.pkg;
        });
      }
    });
  });

  return json;
};

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

const updateAPackage = async (packages, name, version) => {
  const obj = packages[name][version];
  if (obj.updated) return;

  const versions = await getPackageVersions(name);
  semver.rsort(versions);

  // eslint-disable-next-line no-restricted-syntax
  for (const ver of versions) {
    if (semver.lte(ver, version)) {
      obj.updated = true;
      break;
    }

    if (obj.versions.every((range) => semver.satisfies(ver, range))) {
      const pkg = await getPackageInfo(name, ver);
      if (
        (await isCompatibleDeps(pkg.optionalDependencies, obj.pkg.optionalDependencies)) &&
        (await isCompatibleDeps(pkg.dependencies, obj.pkg.dependencies))
      ) {
        obj.pkg = getYarnPackageMeta(pkg, obj.pkg);
        obj.updated = ver;
        break;
      }
    }
  }
};

// TODO: level = 0
const updatePackages = async (yarnLock) => {
  const json = lockFile.parse(yarnLock).object;
  const packages = collectPackages(json);

  const tasks = [];
  Object.keys(packages).forEach((name) => {
    Object.keys(packages[name]).forEach((version) => {
      tasks.push(updateAPackage(packages, name, version));
    });
  });
  await Promise.all(tasks);

  Object.assign(json, selectUpdates(packages));
  return lockFile.stringify(json);
};

module.exports = {
  collectPackages,
  selectUpdates,
  updatePackages,
};
