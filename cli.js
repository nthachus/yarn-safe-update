// #!/usr/bin/env node
const fs = require('fs');

const commander = require('commander');
const { updatePackages } = require('./index');

commander
  .usage('[options] [yarn.lock path (default: yarn.lock)]')
  .option('-p, --print', 'instead of saving the updated yarn.lock, print the result in stdout');

commander.parse(process.argv);

const file = commander.args.length ? commander.args[0] : 'yarn.lock';

try {
  const yarnLock = fs.readFileSync(file, 'utf8');

  const updatedYarnLock = updatePackages(yarnLock);

  if (commander.print) {
    console.log(updatedYarnLock);
  } else if (updatedYarnLock !== yarnLock) {
    fs.writeFileSync(file, updatedYarnLock);
  }

  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
