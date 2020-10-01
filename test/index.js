// @flow
import assert from 'assert';
import lockfile from '@yarnpkg/lockfile';

import type { LockfileObject } from '../src/yarn-api';
import { updatePackages } from '../src';

const parseYarnLock = (content: string): LockfileObject => lockfile.parse(content).object;

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

    const json = parseYarnLock(updated);
    assert.deepStrictEqual(json, parseYarnLock(yarnLock), updated);
  });
});
