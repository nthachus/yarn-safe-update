const path = require('path');
const { execFileSync } = require('child_process');
const assert = require('assert');

const cliFilePath = path.resolve(__dirname, '../src/cli.js');

describe('CLI', () => {
  ['-v', '--version'].forEach((arg) => {
    it(`prints version with option '${arg}'`, () => {
      const out = execFileSync(process.execPath, [cliFilePath, arg]);
      assert(/^\d+(\.\d+)*\s*$/.test(out), out);
    });
  });

  ['-h', '--help'].forEach((arg) => {
    it(`prints help with option '${arg}'`, () => {
      const out = execFileSync(process.execPath, [cliFilePath, arg]);
      assert(/^Usage: cli \[options\] \[yarn\.lock path\b.*?\]/.test(out), out);
    });
  });

  it('fails if given an invalid option', () => {
    assert.throws(
      () => execFileSync(process.execPath, [cliFilePath, '--fail']),
      (e) => e instanceof Error && e.status === 1 && /\bUnknown option\b/i.test(e)
    );
  });

  it('prints updated yarn.lock', () => {
    // TODO !
  });
});
