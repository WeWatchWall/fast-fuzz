import { assert } from 'chai';
const execShellCommand = require("../execShellCommand.js");

let results: any[];

export async function init() {
  if (results === undefined) {
    let cliResult: string = await execShellCommand(`node ./dist/src/bin.js -i "./test/sut" -s "./" -d "../../dist/test/sut" -c "Test" -q true -t 3e3 -n 1e5`);
    
    let error: any;
    try {
      results = JSON.parse(cliResult);
    } catch (e: any) {
      error = e;
    }
    assert.ok(error === undefined);
  }

  return results;
}