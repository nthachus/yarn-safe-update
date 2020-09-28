const assert = require('assert');
const lockFile = require('@yarnpkg/lockfile');
const { updatePackages } = require('../src');

/**
 * @param {string} content
 * @return {Object}
 */
const parseYarnLock = (content) => lockFile.parse(content).object;

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
