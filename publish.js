const execShellCommand = require("./execShellCommand.js");
const packName = 'fast-fuzz';

async function publish() {
  const latestVersion = await import('latest-version');
  let version = await latestVersion.default(packName);
  
  console.log(await execShellCommand('npm publish'));
  console.log(await execShellCommand(`npm unpublish ${packName}@${version}`));
}
publish();