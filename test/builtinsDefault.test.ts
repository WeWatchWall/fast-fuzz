import { expect } from 'chai';
import { init } from './testRunner';

describe('Builtin generators with default values.', function () {
  this.timeout(3 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Builtins');
  });

  it('Generates boolean values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_bool_default');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(4);
  });

  it('Generates integer values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_int_default');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(12);
  });

  it('Generates number values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_float_default');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(16);
  });

  it('Generates date values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_date_default');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(13);
  });

  it('Generates string values.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_string_default');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(7);
  });
});