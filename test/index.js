const lockFile = require('@yarnpkg/lockfile');
const assert = require('assert');
const { updatePackages } = require('../src');

/**
 * @param {string} content
 * @return {Object}
 */
const parseYarnLock = (content) => lockFile.parse(content).object;

describe('Library', () => {
  it('should not update fixed version', async () => {
    const yarnLock = `
library@2.0.0:
  version "2.0.0"
  resolved "https://example.net/library@2.0.0"

library@>=1.0.0:
  version "2.0.0"
  resolved "https://example.net/library@2.0.0"
`;
    const updated = await updatePackages(yarnLock);
    const json = parseYarnLock(updated);

    assert.strictEqual(json['library@2.0.0'].version, '2.0.0', updated);
    assert.strictEqual(json['library@>=1.0.0'].version, '2.0.0', updated);
  });
});
