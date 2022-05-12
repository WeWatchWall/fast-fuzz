import { expect } from 'chai';
import { init } from './testRunner';

describe('Builtin generators with default values.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Builtins');
  });

  it('Generates boolean values.', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_bool_array');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(7);
  });

  it('Generates integer values.', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_int_array');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(15);
  });

  it('Generates number values.', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_float_array');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(19);
  });

  it('Generates date values.', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_date_array');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.greaterThanOrEqual(16);
  });

  it('Generates string values.', async () => {
    let results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'builtin_string_array');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(10);
  });
});