const lockFile = require('@yarnpkg/lockfile');
const semver = require('semver');
const { yarnInfo, parsePackageName, getObjectKeys, buildPackageData } = require('./yarn-api');

/**
 * TODO excludes
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
      console.info(' \x1b[32m%s\x1b[0m %s', '[  FIXED]', name);
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
 * @return {boolean}
 */
const isCompatibleVers = (newVer, oldVer, packages, name) => {
  let obj = packages[name];
  const version = Object.keys(obj).find((v) => obj[v].versions.includes(oldVer));
  if (!version) {
    throw new Error(`Could not found package: ${name}@${oldVer}`);
  }

  obj = obj[version];
  if (!semver.satisfies(version, newVer, true)) {
    if (!obj.updated) {
      updateAPackage(packages, name, version); // eslint-disable-line no-use-before-define
    }

    if (typeof obj.updated !== 'string' || !semver.satisfies(obj.updated, newVer, true)) {
      return false;
    }
  }

  obj.versions.push(newVer);
  if (typeof obj.updated !== 'string') obj.updated = obj.pkg.version;

  return true;
};

/**
 * @param {Object} newDeps
 * @param {Object} oldDeps
 * @param {Object} packages
 * @return {boolean}
 */
const isCompatibleDeps = (newDeps, oldDeps, packages) => {
  const newKeys = getObjectKeys(newDeps);
  if (!newKeys || !newKeys.length) return true;

  const oldKeys = getObjectKeys(oldDeps);
  if (!oldKeys || !oldKeys.length) return false;

  if (newKeys.some((k) => !oldKeys.includes(k))) return false;

  return newKeys.every((name) => {
    if (!newDeps[name] || !oldDeps[name]) return true;

    const newVer = semver.validRange(newDeps[name], true);
    const oldVer = semver.validRange(oldDeps[name], true);

    return (
      newVer === oldVer ||
      newVer === '*' ||
      oldVer === '*' ||
      isCompatibleVers(newDeps[name], oldDeps[name], packages, name)
    );
  });
};

/**
 * @param {Object} packages
 * @param {string} name
 * @param {string} version
 */
const updateAPackage = (packages, name, version) => {
  const obj = packages[name][version];
  if (obj.updated) return;

  const versions = yarnInfo(name, 'versions');
  if (!versions) {
    throw new Error(`Could not fetch package versions: ${name}`);
  }
  semver.rsort(versions, true);

  versions.some((ver) => {
    if (semver.lte(ver, version, true)) {
      obj.updated = true;

      console.info(' \x1b[32m%s\x1b[0m %s@%s', '[HIGHEST]', name, version);
      return true;
    }

    if (
      obj.versions.some(
        (range) => semver.satisfies(version, range, true) && !semver.satisfies(ver, range, true)
      )
    ) {
      return false;
    }

    const pkg = yarnInfo(`${name}@${ver}`);
    if (!pkg) {
      throw new Error(`Could not fetch package info: ${name}@${ver}`);
    }

    if (
      isCompatibleDeps(pkg.optionalDependencies, obj.pkg.optionalDependencies, packages) &&
      isCompatibleDeps(pkg.dependencies, obj.pkg.dependencies, packages)
    ) {
      obj.pkg = buildPackageData(pkg, obj.pkg);
      obj.updated = ver;

      console.warn(' \x1b[33m%s\x1b[0m %s@%s -> %s', '[ UPDATE]', name, version, ver);
      return true;
    }

    return false;
  });
};

/**
 * @param {string} yarnLock
 * @return {string}
 */
const updatePackages = (yarnLock) => {
  const json = lockFile.parse(yarnLock).object;
  const packages = collectPackages(json);

  Object.keys(packages).forEach((name) => {
    Object.keys(packages[name]).forEach((version) => {
      updateAPackage(packages, name, version);
    });
  });

  Object.assign(json, selectUpdates(packages));
  return lockFile.stringify(json);
};

module.exports = {
  collectPackages,
  selectUpdates,
  updatePackages,
};
