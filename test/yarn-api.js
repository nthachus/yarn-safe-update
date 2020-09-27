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
    const versions = await getPackageVersions('p-limit');

    assert(versions && versions.length, JSON.stringify(versions));
    versions.forEach((v) => assert(semver.valid(v), v));
  });

  it('gets information of a package', async () => {
    const info = await getPackageInfo('p-limit', '2.3.0');

    assert(info && typeof info === 'object', JSON.stringify(info));
    assert.strictEqual(info.dist.shasum, '3dd33c647a214fdfffd835933eb086da0dc21db1');
    assert.deepStrictEqual(info.dependencies, { 'p-try': '^2.0.0' });
  });
});
