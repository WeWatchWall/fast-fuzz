import { expect } from 'chai';
import { init } from './testRunner';

describe('Builtin generators with limited values.', function () {
  this.timeout(3 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Builtins');
  });

  it('Generates integer values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_int_limit');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(12);
  });

  it('Generates number values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_float_limit');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(16);
  });

  it('Generates date values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_date_limit');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(13);
  });

  it('Generates string values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_string_limit');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(7);
  });
});