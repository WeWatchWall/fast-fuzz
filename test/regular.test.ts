import { assert } from 'chai';
import { fastFuzz, fastFuzzAsync } from '../index';

import regular from './sut/regular.js';

describe('Regular fuzzing.', function () {
  this.timeout(3e4);

  it('Finds solution in reasonable time 1.', () => {
    const result = fastFuzz(
      regular.regular1,
      './test/sut/regular.js',
      [
        '{"type":"bool"}',
        '{"type":"int","min":0,"max":16}',
        '{"type":"int","min":0}',
        '{"type":"int","min":0}',
        '{"type":"bool"}',
        '{"type":"int","min":0}'
      ],
      [69366, 42808, 5, 26],
      1e4,
      5e7,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 12);
  });

  it('Finds solution in reasonable time 2.', () => {
    const result = fastFuzz(
      regular.regular2,
      './test/sut/regular.js',
      [
        '{"type":"bool"}',
        '{"type":"int","min":0,"max":16}',
        '{"type":"int","min":0}',
        '{"type":"int","min":0}',
        '{"type":"bool"}',
        '{"type":"int","min":0}'
      ],
      [69366, 42808, 5, 26],
      1e4,
      5e7,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 8);
  });

  it('Finds solution in reasonable time 3 - async interface.', async () => {
    const result = await fastFuzzAsync(
      regular.regular3,
      './test/sut/regular.js',
      [
        '{"type":"bool"}',
        '{"type":"int","min":0,"max":16}',
        '{"type":"int","min":0}',
        '{"type":"int","min":0}',
        '{"type":"bool"}',
        '{"type":"int","min":0}'
      ],
      [69366, 42808, 5, 26],
      1e4,
      5e7,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 9);
  });
})
