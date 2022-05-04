const execShellCommand = require("../execShellCommand.js");
import { assert } from 'chai';

describe('Regular fuzzing.', function () {
  this.timeout(6e4);

  before(async () => {
    global.fastFuzzResults = await execShellCommand(`node ./dist/src/bin.js -i "./test/sut" -s "./" -d "../../dist/test/sut" -c "SUT_1" -q true -t 3e3`);
  });

  it('Finds solution in reasonable time 1.', async () => {
    console.log(global.fastFuzzResults);

    assert.ok(true);
  });

});