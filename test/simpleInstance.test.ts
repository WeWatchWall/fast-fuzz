import { expect } from 'chai';
import { init } from './testRunner';

describe('Simple instance methods.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Simple');
  });

  it('Fuzz simple method instance', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'simple_instance_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(3);
  });

  it('Fuzz regular method instance', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'simple_instance_regular');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  it('Fuzz async interface instance', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'simple_instance_IAsync');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });

  
  it('Fuzz async method instance', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'simple_instance_async');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(6);
  });
});