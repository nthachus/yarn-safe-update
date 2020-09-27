const assert = require('assert');
const semver = require('semver');
const { getYarnResult, getPackageVersions, getPackageInfo } = require('../src/yarn-api');

describe('Yarn API', () => {
  [null, false, undefined].forEach((arg) => {
    it(`failed to get yarn result from ${JSON.stringify(arg)}`, () => {
      assert.throws(() => getYarnResult(null), TypeError);
    });
  });

  it('gets versions of a package', async () => {
    const versions = await getPackageVersions('isobject');

    assert(versions && versions.length, JSON.stringify(versions));
    versions.forEach((v) => assert(semver.valid(v), v));
  });

  it('gets information of a package', async () => {
    const info = await getPackageInfo('isobject', '2.1.0');

    assert(info && typeof info === 'object', JSON.stringify(info));
    assert.deepStrictEqual(info.dependencies, { isarray: '1.0.0' });
  });
});
