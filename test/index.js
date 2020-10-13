// @flow
import { expect } from 'chai';
import { updatePackages } from '../src';

const cleanYarnLock = (content: string): string => content && content.replace(/^(# .*\n)+\n/, '');

describe('Library', () => {
  it('should not update fixed version', () => {
    const yarnLock = `
library@2.0.0:
  version "2.0.0"
  resolved "https://example.net/library@2.0.0"

library@>=1.0.0:
  version "2.0.0"
  resolved "https://example.net/library@2.0.0"
`;
    const updated = updatePackages(yarnLock);

    expect(cleanYarnLock(updated)).to.equal(yarnLock);
  });

  it('should update to the highest version', () => {
    // noinspection SpellCheckingInspection
    const yarnLock = `
brace-expansion@^1.0.0:
  version "1.1.11"
  resolved "https://registry.yarnpkg.com/brace-expansion/-/brace-expansion-1.1.11.tgz#3c7fcbf529d87226f3d2f52b966ff5271eb441dd"
  integrity sha512-iCuPHDFgrHX7H2vEI/5xpz07zSHB00TpugqhmYtVmMO6518mCuRMoOYFldEBl0g187ufozdaHgWKcYFb61qGiA==

"minimatch@>=3.0.0 <3.0.5":
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/minimatch/-/minimatch-3.0.0.tgz#5236157a51e4f004c177fb3c527ff7dd78f0ef83"
  integrity sha1-UjYVelHk8ATBd/s8Un/33Xjw74M=
  dependencies:
    brace-expansion "^1.0.0"
`;
    const updated = updatePackages(yarnLock);

    // noinspection SpellCheckingInspection
    expect(cleanYarnLock(updated)).to.equal(`
brace-expansion@^1.0.0, brace-expansion@^1.1.7:
  version "1.1.11"
  resolved "https://registry.yarnpkg.com/brace-expansion/-/brace-expansion-1.1.11.tgz#3c7fcbf529d87226f3d2f52b966ff5271eb441dd"
  integrity sha512-iCuPHDFgrHX7H2vEI/5xpz07zSHB00TpugqhmYtVmMO6518mCuRMoOYFldEBl0g187ufozdaHgWKcYFb61qGiA==

"minimatch@>=3.0.0 <3.0.5":
  version "3.0.4"
  resolved "https://registry.yarnpkg.com/minimatch/-/minimatch-3.0.4.tgz#5166e286457f03306064be5497e8dbb0c3d32083"
  integrity sha512-yJHVQEhyqPLUTgt9B83PXu6W3rx4MvvHvSUvToogpwoGDOUQ+yDrR0HRot+yOCdCO7u4hX3pWft6kWBBcqh0UA==
  dependencies:
    brace-expansion "^1.1.7"
`);
  });

  it('should update related packages', () => {
    // noinspection SpellCheckingInspection
    const yarnLock = `
balanced-match@>=0.3.0:
  version "0.4.2"
  resolved "https://registry.yarnpkg.com/balanced-match/-/balanced-match-0.4.2.tgz#cb3f3e3c732dc0f01ee70b403f302e61d7709838"
  integrity sha1-ibTRmasr7kneFk6gK4nORi1xt2c=

brace-expansion@^1.0.0:
  version "1.1.3"
  resolved "https://registry.yarnpkg.com/brace-expansion/-/brace-expansion-1.1.3.tgz#46bff50115d47fc9ab89854abb87d98078a10991"
  dependencies:
    balanced-match ">=0.3.0"
    concat-map "0"

concat-map@0:
  version "0.0.1"
  resolved "https://registry.yarnpkg.com/concat-map/-/concat-map-0.0.1.tgz#d8a96bd77fd68df7793a73036a3ba0d5405d477b"
  integrity sha1-2Klr13/Wjfd5OnMDajug1UBdR3s=

"minimatch@>=3.0.0 <3.0.5":
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/minimatch/-/minimatch-3.0.0.tgz#5236157a51e4f004c177fb3c527ff7dd78f0ef83"
  integrity sha1-UjYVelHk8ATBd/s8Un/33Xjw74M=
  dependencies:
    brace-expansion "^1.0.0"
`;
    const updated = updatePackages(yarnLock);

    // noinspection SpellCheckingInspection
    expect(cleanYarnLock(updated)).to.equal(`
balanced-match@>=0.3.0, balanced-match@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/balanced-match/-/balanced-match-1.0.0.tgz#89b4d199ab2bee49de164ea02b89ce462d71b767"

brace-expansion@^1.0.0, brace-expansion@^1.1.7:
  version "1.1.11"
  resolved "https://registry.yarnpkg.com/brace-expansion/-/brace-expansion-1.1.11.tgz#3c7fcbf529d87226f3d2f52b966ff5271eb441dd"
  integrity sha512-iCuPHDFgrHX7H2vEI/5xpz07zSHB00TpugqhmYtVmMO6518mCuRMoOYFldEBl0g187ufozdaHgWKcYFb61qGiA==
  dependencies:
    balanced-match "^1.0.0"
    concat-map "0.0.1"

concat-map@0, concat-map@0.0.1:
  version "0.0.1"
  resolved "https://registry.yarnpkg.com/concat-map/-/concat-map-0.0.1.tgz#d8a96bd77fd68df7793a73036a3ba0d5405d477b"
  integrity sha1-2Klr13/Wjfd5OnMDajug1UBdR3s=

"minimatch@>=3.0.0 <3.0.5":
  version "3.0.4"
  resolved "https://registry.yarnpkg.com/minimatch/-/minimatch-3.0.4.tgz#5166e286457f03306064be5497e8dbb0c3d32083"
  integrity sha512-yJHVQEhyqPLUTgt9B83PXu6W3rx4MvvHvSUvToogpwoGDOUQ+yDrR0HRot+yOCdCO7u4hX3pWft6kWBBcqh0UA==
  dependencies:
    brace-expansion "^1.1.7"
`);
  });
});
