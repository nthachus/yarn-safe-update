const originalStdoutWrite = process.stdout.write;

/**
 * @param {Array} results
 * @return {Function}
 */
const hookStdout = (results) => {
  process.stdout.write = (data, ...args) => {
    if (/^{"type":".+}\s*$/s.test(data)) {
      results.push(JSON.parse(data));
    } else {
      originalStdoutWrite.call(process.stdout, data, ...args);
    }
  };

  return () => {
    process.stdout.write = originalStdoutWrite;
  };
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
const getYarnPackageMeta = (pkg, oldPkg) => ({
  version: pkg.version,
  resolved: resolvePackageUrl(pkg, oldPkg),
  integrity: pkg.dist && pkg.dist.integrity,
  dependencies: pkg.dependencies,
  optionalDependencies: pkg.optionalDependencies,
});

module.exports = {
  hookStdout,
  parsePackageName,
  getObjectKeys,
  escapeRegex,
  getYarnPackageMeta,
};
