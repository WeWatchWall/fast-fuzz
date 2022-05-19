import { expect } from 'chai';
import { init } from './testRunner';

describe('Type generators with inherited values.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Type', 5e3, 3e3);
  });

  it('Generates single instance of type.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'type_inherit_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Generates instance array of type.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'type_inherit_abstract');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Generates single instance of type for a regular function.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'type_inherit_interface');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });
});