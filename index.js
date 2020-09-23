const lockfile = require('@yarnpkg/lockfile');
const semver = require('semver');

const parseYarnLock = (file) => lockfile.parse(file).object;

const fetchPackageInfo = (pkgName, { version, field } = {}) => {
  const oldArgv = process.argv;

  const pkg = version && version === semver.coerce(version) ? `${pkgName}@${version}` : pkgName;
  process.argv = [process.argv0, 'yarn', 'info', '--json', pkg, field].filter(Boolean);

  try {
    console.log(process.argv);
    const cli = require('yarn/lib/cli'); // eslint-disable-line global-require
    cli.default();
    console.log(cli);
  } finally {
    process.argv = oldArgv;
    console.log(process.argv);
  }
};

// TODO: level = 0
module.exports.updatePackages = (yarnLock) => {
  const json = parseYarnLock(yarnLock);

  console.log(json);
  fetchPackageInfo('semver', { field: 'versions' });

  return lockfile.stringify(json);
};
