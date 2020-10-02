// @flow
import { expect } from 'chai';
import semver from 'semver';

import type { Manifest } from '../src/yarn-api';
import { parsePackageName, yarnInfo } from '../src/yarn-api';

describe('Yarn API', () => {
  it('parses package name', () => {
    expect(parsePackageName('@foo')).to.deep.equal(['@foo', null]);
    expect(parsePackageName('@foo@')).to.deep.equal(['@foo', '']);
  });

  [null, false, undefined, {}].forEach((arg: string | any) => {
    it(`failed to parse package name ${JSON.stringify(arg)}`, () => {
      expect(() => parsePackageName(arg)).to.throw(TypeError);
    });
  });

  it('gets versions of a package', () => {
    const versions: string[] = yarnInfo('p-limit', 'versions');

    expect(versions)
      .to.be.an('array')
      .that.satisfy((arr) => arr.every((v) => semver.valid(v, true)));
  });

  it('gets information of a package', () => {
    const info: Manifest = yarnInfo('p-limit@2.3.0');

    expect(info)
      .to.be.an('object')
      .that.deep.include({ dependencies: { 'p-try': '^2.0.0' } })
      .and.nested.include({ 'dist.shasum': '3dd33c647a214fdfffd835933eb086da0dc21db1' });
  });
});
