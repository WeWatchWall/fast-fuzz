'use strict';
/* global describe, it */

const assert = require('chai').assert;
const { fastFuzz } = require('../dist/index.js');

describe('Regular fuzzing.', function () {
  this.timeout(0);

  it('Finds solution in reasonable time 1.', async () => {
    let result = await fastFuzz(
      './test/sut/regular.js',
      'regular1',
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

  it('Finds solution in reasonable time 2.', async () => {
    let result = await fastFuzz(
      './test/sut/regular.js',
      'regular2',
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

    
  it('Finds solution in reasonable time 3.', async () => {
    let result = await fastFuzz(
      './test/sut/regular.js',
      'regular3',
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
