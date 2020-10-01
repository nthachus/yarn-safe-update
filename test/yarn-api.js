// @flow
import assert from 'assert';
import semver from 'semver';

import type { Manifest } from '../src/yarn-api';
import { parsePackageName, yarnInfo } from '../src/yarn-api';

describe('Yarn API', () => {
  it('parses package name', () => {
    assert.deepStrictEqual(parsePackageName('@foo'), ['@foo', null]);
    assert.deepStrictEqual(parsePackageName('@foo@'), ['@foo', '']);
  });

  [null, false, undefined, {}].forEach((arg) => {
    it(`failed to parse package name ${JSON.stringify(arg)}`, () => {
      assert.throws(() => parsePackageName(arg), TypeError);
    });
  });

  it('gets versions of a package', () => {
    const versions = yarnInfo('p-limit', 'versions');

    assert(versions && versions.length, JSON.stringify(versions));
    versions.forEach((v) => assert(semver.valid(v, true), v));
  });

  it('gets information of a package', () => {
    const info: ?Manifest = yarnInfo('p-limit@2.3.0');

    assert(info && typeof info === 'object', JSON.stringify(info));
    assert.deepStrictEqual(info.dependencies, { 'p-try': '^2.0.0' });
    assert.strictEqual(info.dist.shasum, '3dd33c647a214fdfffd835933eb086da0dc21db1');
  });
});
