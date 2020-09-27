/* eslint no-await-in-loop: 0 */
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
 * @param {string} newVer
 * @param {string} oldVer
 * @param {Object} packages
 * @param {string} name
 * @return {Promise<boolean>}
 */
const isCompatibleVers = async (newVer, oldVer, packages, name) => {
  let obj = packages[name];
  const version = Object.keys(obj).find((v) => obj[v].versions.includes(oldVer));
  if (!version) {
    throw new Error(`Could not found package: ${name}@${oldVer}`);
  }

  if (semver.satisfies(version, newVer, true)) return true;

  obj = obj[version];
  while (!obj.updated) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return typeof obj.updated === 'string' && semver.satisfies(obj.updated, newVer, true);
};

/**
 * @param {Object} newDeps
 * @param {Object} oldDeps
 * @param {Object} packages
 * @return {Promise<boolean>}
 */
const isCompatibleDeps = async (newDeps, oldDeps, packages) => {
  const newKeys = getObjectKeys(newDeps);
  if (!newKeys || !newKeys.length) return true;

  const oldKeys = getObjectKeys(oldDeps);
  if (!oldKeys || !oldKeys.length) return false;

  if (newKeys.some((k) => !oldKeys.includes(k))) return false;

  for (let i = newKeys.length - 1; i > 0; i -= 1) {
    const name = newKeys[i];
    if (oldDeps[name] && newDeps[name]) {
      const oldVer = semver.validRange(oldDeps[name], true);
      const newVer = semver.validRange(newDeps[name], true);

      if (
        newVer !== oldVer &&
        newVer !== '*' &&
        oldVer !== '*' &&
        !(await isCompatibleVers(newVer, oldVer, packages, name))
      ) {
        return false;
      }
    }
  }

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
  if (!versions) {
    throw new Error(`Could not fetch package versions: ${name}`);
  }

  semver.sort(versions, true);
  for (let i = versions.length - 1; i > 0; i -= 1) {
    const ver = versions[i];
    if (semver.lte(ver, version, true)) {
      obj.updated = true;
      break;
    }

    if (obj.versions.every((range) => semver.satisfies(ver, range, true))) {
      const pkg = await getPackageInfo(name, ver);
      if (!pkg) {
        throw new Error(`Could not fetch package info: ${name}@${ver}`);
      }

      const oldPkg = obj.pkg;
      if (
        (await isCompatibleDeps(pkg.optionalDependencies, oldPkg.optionalDependencies, packages)) &&
        (await isCompatibleDeps(pkg.dependencies, oldPkg.dependencies, packages))
      ) {
        obj.pkg = getYarnPackageMeta(pkg, oldPkg);
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
