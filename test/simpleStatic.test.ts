import { expect } from 'chai';
import { init } from './testRunner';

describe('Simple static methods.', function () {
  this.timeout(10 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Simple');
  });

  it('Fuzz simple method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'simple_static_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(3);
  });

  it('Fuzz regular method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'simple_static_regular');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Fuzz async interface static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'simple_static_IAsync');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  
  it('Fuzz async method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'simple_static_async');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });
});