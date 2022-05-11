import { expect } from 'chai';
import { init } from './testRunner';

describe('Simple skips.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Skip');
  });

  it('Fuzz simple method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_instance_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(1);
  });

  it('Fuzz regular method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_static_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(1);
  });

  it('Fuzz async interface static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_static_skip');
    expect(method).to.equal(undefined);
  });

  
  it('Fuzz async method static', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_static_all');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(1);
  });
});