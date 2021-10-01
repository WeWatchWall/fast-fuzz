'use strict';
/* global describe, it */

const assert = require('chai').assert;
const { fastFuzz } = require('../dist/index.js');

describe('Regular fuzzing.', function () {
  this.timeout(0);

  it('Finds solution in reasonable time.', () => {
    let result = fastFuzz(
      './test/sut/regular.js',
      'regular',
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
})
