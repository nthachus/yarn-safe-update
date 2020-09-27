const lockFile = require('@yarnpkg/lockfile');
const semver = require('semver');

const { getPackageVersions, getPackageInfo } = require('./yarn-api');
const { parsePackageName, getObjectKeys, getYarnPackageMeta } = require('./utils');

/**
 * @param {Object} json
 * @return {Object}
 */
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

/**
 * @param {Object} packages
 * @return {Object}
 */
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

/**
 * @param {Object} newDeps
 * @param {Object} oldDeps
 * @return {Promise<boolean>}
 */
const isCompatibleDeps = async (newDeps, oldDeps) => {
  const newKeys = getObjectKeys(newDeps);
  if (!newKeys || !newKeys.length) return true;

  const oldKeys = getObjectKeys(oldDeps);
  if (!oldKeys || !oldKeys.length) return false;

  if (newKeys.some((k) => !oldKeys.includes(k))) return false;

  // TODO !

  return true;
};

/**
 * @param {Object} packages
 * @param {string} name
 * @param {string} version
 * @return {Promise<undefined>}
 */
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

    /* eslint-disable no-await-in-loop */
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

/**
 * TODO: level = 0
 * @param {string} yarnLock
 * @return {Promise<string>}
 */
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
