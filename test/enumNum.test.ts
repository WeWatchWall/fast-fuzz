import { expect } from 'chai';
import { init } from './testRunner';

describe('Enum generators with numeric values.', function () {
  this.timeout(3 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Enum');
  });

  it('Generates default values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'enum_num_default');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(17);
  });

  it('Generates autoincrement values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'enum_num_auto');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(18);
  });
});