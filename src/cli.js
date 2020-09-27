#!/usr/bin/env node

const fs = require('fs');
const commander = require('commander');
const { version } = require('../package.json');

commander
  .version(version, '-v, --version')
  .usage('[options] [yarn.lock path (default: yarn.lock)]')
  .option('-p, --print', 'instead of saving the updated yarn.lock, print the result in stdout');

commander.parse(process.argv);
const file = commander.args.length ? commander.args[0] : 'yarn.lock';

const { updatePackages } = require('./index');

/**
 * @param {string} path
 * @param {Object} opts
 */
const main = async (path, opts) => {
  try {
    const yarnLock = fs.readFileSync(path, 'utf8');
    const updatedYarnLock = await updatePackages(yarnLock);

    if (opts.print) {
      console.log(updatedYarnLock);
    } else if (updatedYarnLock !== yarnLock) {
      fs.writeFileSync(path, updatedYarnLock);
    }

    process.exitCode = 0;
  } catch (e) {
    console.error(e);
    process.exitCode = -1;
  }
};

// noinspection JSIgnoredPromiseFromCall
main(file, commander.opts());
