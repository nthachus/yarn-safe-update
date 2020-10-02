// @flow
import path from 'path';
import { execFileSync } from 'child_process';
import { expect } from 'chai';

const cliFilePath = path.resolve(__dirname, '../dist/cli.js');
const executeCli = (...args: string[]) => execFileSync(process.execPath, [cliFilePath, ...args]);

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
    // TODO !
  });
});
