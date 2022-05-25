import { expect } from 'chai';
import { init } from './testRunner';

describe('Skip decorator targets.', function () {
  this.timeout(3 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await init('Skip');
  });

  it('Skip property in simple instance method.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_instance_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(1);
  });

  it('Skip argument in simple static method.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_static_simple');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(1);
  });

  it('Skip simple static method.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_static_skip');
    expect(method).to.equal(undefined);
  });

  it('Skip all arguments in simple static method.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_static_all');
    expect(method).to.not.equal(undefined);
    expect(method.results.length).to.equal(1);
  });

  it('Skip simple instance method.', async () => {
    const results: any[] = global.fastFuzzResults;

    const method = results.find((result: any) => result.name === 'skip_instance_skip');
    expect(method).to.equal(undefined);
  });
});