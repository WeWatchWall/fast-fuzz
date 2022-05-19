import { expect } from 'chai';
import { init } from './testRunner';

describe('Regular static methods.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    // Params to get all the results: 180e3, 3e6.
    global.fastFuzzResults = await init('Regular', 60e3);
  });

  it('Fuzz simple method static', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'regular_static_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(3);
  });

  it('Fuzz regular method static', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'regular_static_regular');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(4);
  });

  it('Fuzz async interface static', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'regular_static_IAsync');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(4);
  });

  // it('Fuzz async method static', async () => {
  //   let results: any[] = global.fastFuzzResults;

  //   const method = results.find((result: any) => result.name === 'regular_static_async');
  //   expect(method).to.not.equal(undefined);
  //   expect(method.results.length).to.greaterThanOrEqual(4);
  // });
});