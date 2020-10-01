// @flow
import path from 'path';
import { execFileSync } from 'child_process';
import assert from 'assert';

const cliFilePath = path.resolve(__dirname, '../dist/cli.js');
const executeCli = (...args: string[]): string => execFileSync(process.execPath, [cliFilePath, ...args]);

describe('CLI', () => {
  ['-v', '--version'].forEach((arg) => {
    it(`prints version with option '${arg}'`, () => {
      const out = executeCli(arg);
      assert(/^\d+(\.\d+)*\s*$/.test(out), out);
    });
  });

  ['-h', '--help'].forEach((arg) => {
    it(`prints help with option '${arg}'`, () => {
      const out = executeCli(arg);
      assert(/^Usage: cli \[options] \[yarn\.lock path\b.*?]/.test(out), out);
    });
  });

  it('fails if given an invalid option', () => {
    assert.throws(
      () => executeCli('--fail'),
      (e) => e instanceof Error && e.status === 1 && /\bUnknown option\b/i.test(e)
    );
  });

  it('prints updated yarn.lock', () => {
    // TODO !
  });
});
