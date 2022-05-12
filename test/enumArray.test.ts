import { expect } from 'chai';
import { init } from './testRunner';

describe('Enum array generators with numeric values.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Enum');
  });

  it('Generates default values.', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'enum_num_array');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(20);
  });
});