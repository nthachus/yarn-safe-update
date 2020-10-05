// @flow
import path from 'path';
import { execFileSync } from 'child_process';
import { expect } from 'chai';

const cliFilePath = path.resolve(__dirname, '../dist/cli.js');
const executeCli = (...args: string[]) => execFileSync(process.execPath, [cliFilePath, ...args]);

const lockFilePath = path.relative(process.cwd(), path.resolve(__dirname, 'fixtures/yarn.lock'));

describe('CLI', () => {
  ['-v', '--version'].forEach((arg: string) => {
    it(`prints version with option '${arg}'`, () => {
      const out = executeCli(arg);
      expect(out).to.match(/^\d+(\.\d+)*\s*$/);
    });
  });

  ['-h', '--help'].forEach((arg: string) => {
    it(`prints help with option '${arg}'`, () => {
      const out = executeCli(arg);
      expect(out).to.match(/^Usage: cli \[options] \[yarn\.lock path\b.*?]/);
    });
  });

  it('fails if given an invalid option', () => {
    expect(() => executeCli('--fail'))
      .to.throw(Error, /\bUnknown option\b/i)
      .with.property('status', 1);
  });

  it('prints updated yarn.lock', () => {
    const out = executeCli(lockFilePath, '-p');
    expect(out)
      .to.match(/^.*?\[\s*FIXED].*? concat-map@0\.0\.1/m)
      .and.match(/^.*?\[\s*UPDATE].*? minimatch@3\.0\.0 -> 3/m)
      .and.match(/^brace-expansion@\^1\.0\.0, brace-expansion@.*:$/m)
      .and.match(/^concat-map@0\.0\.1:$/m)
      .and.match(/[\r\n]minimatch@\^3\.0\.0:\s+version "/)
      .and.not.match(/[\r\n]minimatch@\^3\.0\.0:\s+version "3\.0\.0"/);
  });
});
