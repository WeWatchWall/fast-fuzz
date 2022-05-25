import { expect } from 'chai';
import { init } from './testRunner';

describe('Enum generators with dictionary values.', function () {
  this.timeout(3 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Enum');
  });

  it('Generates broken numeric series.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'enum_dict_num');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(17);
  });

  it('Generates single string value.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'enum_dict_mix');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(17);
  });

  it('Generates broken numeric series and string value.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'enum_dict_mix_num');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(17);
  });

  it('Generates autoincrement and string value.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'enum_dict_mix_auto');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(18);
  });
});