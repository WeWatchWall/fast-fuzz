import { expect } from 'chai';
import { init } from './testRunner';

describe('Type generators with simple values.', function () {
  this.timeout(3 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Type');
  });

  it('Generates single instance of type.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'type_single_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Generates instance array of type.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'type_single_array');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(9);
  });

  it('Generates single instance of type for a regular function.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'type_single_regular');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.be.greaterThanOrEqual(6);
  });
});