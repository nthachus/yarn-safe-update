#!/usr/bin/env node
// @flow
import fs from 'fs';
import commander from 'commander';

import { version } from '../package.json';
import { updatePackages } from './index';

const program = commander
  .version(version, '-v, --version')
  .usage('[options] [yarn.lock path (default: yarn.lock)]')
  .option('-p, --print', 'instead of saving the updated yarn.lock, print the result in stdout')
  .parse(process.argv);

const file = program.args.length ? program.args[0] : 'yarn.lock';

try {
  const yarnLock = fs.readFileSync(file, 'utf8');
  const updatedYarnLock = updatePackages(yarnLock);

  if (program.print) {
    console.log(updatedYarnLock);
  } else if (updatedYarnLock !== yarnLock) {
    fs.writeFileSync(file, updatedYarnLock);
  }

  process.exitCode = 0;
} catch (e) {
  console.error(e);
  process.exitCode = -1;
}
