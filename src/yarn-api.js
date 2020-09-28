const { execSync } = require('child_process');

/**
 * @param {string} pkg
 * @param {?string=} field
 * @return {*}
 */
const yarnInfo = (pkg, field = null) => {
  const out = execSync(`yarn info --json "${pkg}" ${field || ''}`);

  const m = /^{"type":"inspect".*}\s*$/m.exec(out);
  if (!m) throw new Error(out.toString().trim());

  return JSON.parse(m[0]).data;
};

/**
 * @param {string} name
 * @return {string[]}
 */
const parsePackageName = (name) => {
  const i = name.lastIndexOf('@');
  return i > 0 ? [name.substr(0, i), name.substr(i + 1)] : [name, null];
};

/**
 * @param {Object} obj
 * @return {string[]}
 */
const getObjectKeys = (obj) => obj && Object.keys(obj);

/**
 * @param {string} text
 * @return {string}
 */
const escapeRegex = (text) => text.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');

/**
 * @param {Object} pkg
 * @param {Object} oldPkg
 * @return {string}
 */
const resolvePackageUrl = (pkg, oldPkg) => {
  let url =
    pkg.dist && pkg.dist.tarball
      ? pkg.dist.tarball.replace('.npmjs.org/', '.yarnpkg.com/')
      : oldPkg.resolved.replace(new RegExp(`\\b${escapeRegex(oldPkg.version)}\\b`), pkg.version);

  url = url.replace(/#[^#]*$/, '');
  return pkg.dist && pkg.dist.shasum ? `${url}#${pkg.dist.shasum}` : url;
};

/**
 * @param {Object} pkg
 * @param {Object} oldPkg
 * @return {*}
 */
const buildPackageData = (pkg, oldPkg) => ({
  version: pkg.version,
  resolved: resolvePackageUrl(pkg, oldPkg),
  integrity: pkg.dist && pkg.dist.integrity,
  dependencies: pkg.dependencies,
  optionalDependencies: pkg.optionalDependencies,
});

module.exports = {
  yarnInfo,
  parsePackageName,
  getObjectKeys,
  escapeRegex,
  resolvePackageUrl,
  buildPackageData,
};
