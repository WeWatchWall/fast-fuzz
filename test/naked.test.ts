import { expect } from 'chai';
import { init } from './testRunner';

describe('Naked generators with simple values.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Naked', 30e3, 5e5);
  });

  it('Generates single buillt-in argument for non-decorated method.', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'naked_static');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(3);
  });

  it('Generates single instance of type with non-decorated method.', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'naked_instance');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(3);
  });
});