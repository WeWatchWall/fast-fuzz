import fs from 'fs';
import { assert } from 'chai';
const execShellCommand = require("../execShellCommand.js");

const results: { [key: string]: any[] } = {};

export async function init(
  name: string,
  time = 5e3,
  runCount = 1e4
): Promise<any[]> {
  if (results[name] === undefined) {
    // Get rid of previous instances.
    const fileName = './test/sut/fuzzInstances.json';
    if (name !== 'Stuff' && fs.existsSync(fileName)) {
      fs.unlinkSync(fileName);
    }

    const cliResult: string = await execShellCommand(`node ./dist/src/index.js -i "./test/sut" -s "./" -d "../../dist/test/sut" -c "${name}" -t ${time} -n ${runCount} -q true`);
    
    let error: any;
    try {
      results[name] = JSON.parse(cliResult);
    } catch (e: any) {
      error = e;
    }
    assert.ok(error === undefined);
  }

  return results[name];
}