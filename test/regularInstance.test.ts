import { expect } from 'chai';
import { init } from './testRunner';

describe('Regular instance methods.', function () {
  this.timeout(3 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Regular');
  });

  it('Fuzz simple method instance', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'regular_instance_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(3);
  });

  it('Fuzz regular method instance', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'regular_instance_regular');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(4);
  });

  it('Fuzz async interface instance', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'regular_instance_IAsync');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(4);
  });

  it('Fuzz async method instance', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'regular_instance_async');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(3);
  });
});