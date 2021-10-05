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

  it('Shuffles arrays.', () => {
    let result = fastFuzz(
      './test/sut/simple.js',
      null,
      [
        {
          array_shuffled: true
        },
        '{"type":"int"}',
        '{"type":"string"}',
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

  it('Slices arrays.', () => {
    let result = fastFuzz(
      './test/sut/simple.js',
      null,
      [
        {
          array_partial: true
        },
        '{"type":"int"}',
        '{"type":"bool"}',
        '{"type":"int"}',
        '{"type":"string"}'
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
  
  it('Requires object keys.', () => {
    let result = fastFuzz(
      './test/sut/simple.js',
      null,
      {
        object_options: {
          object_required: [0, 1, 2],
          object_partial: true // Gets ignored
        },
        0: '{"type":"string"}',
        1: '{"type":"int"}',
        2: '{"type":"int"}',
        3: '{"type":"bool"}'
      },
      ['Bob', 'Alice', 22, 10, 7],
      1e3,
      5e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 6);
  });
    
  it('Slices objects.', () => {
    let result = fastFuzz(
      './test/sut/simple.js',
      null,
      {
        object_options: {
          object_partial: true
        },
        0: '{"type":"string"}',
        1: '{"type":"int"}',
        2: '{"type":"int"}',
        3: '{"type":"bool"}'
      },
      ['Bob', 'Alice', 22, 10, 7],
      1e3,
      5e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 6);
  });
})
