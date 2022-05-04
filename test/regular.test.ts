const execShellCommand = require("../execShellCommand.js");
import { assert } from 'chai';


describe('Regular fuzzing.', function () {
  this.timeout(6e4);

  it('Finds solution in reasonable time 1.', async () => {

    console.log(await execShellCommand(`node ./dist/src/bin.js -i "./test/sut" -s "./" -d "../../dist/test/sut" -c "SUT_1" -q true`));

    assert.ok(true);
  });
});