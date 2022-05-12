import { expect } from 'chai';
import { init } from './testRunner';

describe('Guided static methods.', function () {
  this.timeout(10 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Guided', 5e3, 1.5e5);
  });

  it('Fuzz simple method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'guided_static_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(3);
  });

  it('Fuzz regular method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'guided_static_regular');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Fuzz async interface static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'guided_static_IAsync');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Fuzz async method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'guided_static_async');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });
});