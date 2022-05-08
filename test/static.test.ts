import { assert } from 'chai';
import { init } from './testRunner';

describe('Static methods.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init();
  });

  it('Fuzz simple method', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'static_simple');
    assert.ok(method !== undefined);
    assert.ok(method.results.length === 3);
  });

  it('Fuzz regular method', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'static_regular');
    assert.ok(method !== undefined);
    assert.ok(method.results.length === 4);
  });

  it('Fuzz async interface', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'static_IAsync');
    assert.ok(method !== undefined);
    assert.ok(method.results.length === 4);
  });

  
  it('Fuzz async method', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'static_async');
    assert.ok(method !== undefined);
    assert.ok(method.results.length === 4);
  });
});