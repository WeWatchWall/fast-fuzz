import { expect } from 'chai';
import { init } from './testRunner';

describe('Guided instance methods.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Guided', 10e3, 3e5);
  });

  it('Fuzz simple method instance', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'guided_instance_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(3);
  });

  it('Fuzz regular method instance', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'guided_instance_regular');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Fuzz async interface instance', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'guided_instance_IAsync');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Fuzz async method instance', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'guided_instance_async');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(5);
  });
});