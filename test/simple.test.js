'use strict';
/* global describe, it */

const assert = require('chai').assert;
const { fastFuzz } = require('../dist/index.js');

describe('Simple literal fuzzing.', function () {
  this.timeout(0);

  it('Stuffs literals.', () => {
    let result = fastFuzz(
      './test/sut/simple.js',
      null,
      [
        '{"type":"string"}',
        '{"type":"int"}',
        '{"type":"int"}'
      ],
      ['Bob', 'Alice', 22, 10, 7],
      1e3,
      5e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 6);
  });

  it('Fuzzes full search.', () => {
    let result = fastFuzz(
      './test/sut/simple.js',
      null,
      [
        '{"type":"string"}',
        '{"type":"int"}',
        '{"type":"int"}'
      ],
      ['Bob', 'Alice', 220, 100, 70],
      6e4,
      5e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 6);
  });
})
