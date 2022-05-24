import './typeInherit.test';
import { expect } from 'chai';
import { init } from './testRunner';

describe('Type generators with inherited values', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Stuff', 5e3, 3e3);
  });

  it('Loads and uses the fuzzInstances.json file.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'stuff_instance');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });
});