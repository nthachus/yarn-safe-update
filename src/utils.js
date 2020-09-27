const originalStdoutWrite = process.stdout.write;

const hookStdout = (results) => {
  process.stdout.write = (data, ...args) => {
    if (/^\{"type":".*?".*\}\s*$/.test(data)) {
      results.push(JSON.parse(data));
    } else {
      originalStdoutWrite.call(process.stdout, data, ...args);
    }
  };

  return () => {
    process.stdout.write = originalStdoutWrite;
  };
};

const parsePackageName = (name) => {
  const i = name.lastIndexOf('@');
  return i > 0 ? [name.substr(0, i), name.substr(i + 1)] : [name, null];
};

const getObjectKeys = (obj) => obj && Object.keys(obj);

const resolvePackageUrl = (pkg, oldPkg) =>
  oldPkg.resolved
    .replace(`-${oldPkg.version}.`, `-${pkg.version}.`)
    .replace(/#[0-9a-f]+$/i, pkg.dist && pkg.dist.shasum ? `#${pkg.dist.shasum}` : '');

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
  getYarnPackageMeta,
};
