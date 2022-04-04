'use strict';
/* global describe, it */

const assert = require('chai').assert;
const { fastFuzz, fastFuzzAsync } = require('../dist/index.js');

const simple = require('./sut/simple.js');
const async = require('./sut/async.js');

describe('Simple literal fuzzing.', function () {
  this.timeout(0);

  it('Stuffs literals.', () => {
    let result = fastFuzz(
      simple,
      './test/sut/simple.js',
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

  it('Sync fuzzes full search.', () => {
    let result = fastFuzz(
      simple,
      './test/sut/simple.js',
      [
        '{"type":"string"}',
        '{"type":"int"}',
        '{"type":"int"}'
      ],
      ['Bob', 'Alice', 220, 100, 70],
      75e3,
      6e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 6);
  });

  it('Fuzzes full search - async interface.', async () => {
    let result = await fastFuzzAsync(
      simple,
      './test/sut/simple.js',
      [
        '{"type":"string", "max":1}',
        '{"type":"int", "min":-50, "max":50}',
        '{"type":"int", "min":-50, "max":50}'
      ],
      ['Bob', 'Alice', 220, 100, 70],
      3e4,
      7e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 6);
  });

  it('Fuzzes full search - async.', async () => {
    let result = await fastFuzzAsync(
      async,
      './test/sut/async.js',
      [
        '{"type":"string", "max":1}',
        '{"type":"int", "min":20, "max":25}',
        '{"type":"int", "min":5, "max":10}'
      ],
      ['Bob', 'Alice', 220, 100, 70],
      1e4,
      1e3,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 6);
  });

  it('Shuffles arrays.', async () => {
    let result = await fastFuzz(
      simple,
      './test/sut/simple.js',
      [
        {
          array_shuffled: true
        },
        '{"type":"int"}',
        '{"type":"string"}',
        '{"type":"int"}'
      ],
      ['Bob', 'Alice', 22, 10, 7],
      3e3,
      6e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 6);
  });

  it('Sync slices arrays.', () => {
    let result = fastFuzz(
      simple,
      './test/sut/simple.js',
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
      3e3,
      6e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 7);
  });

  it('Async slices arrays.', async () => {
    let result = await fastFuzzAsync(
      simple,
      './test/sut/simple.js',
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
      3e3,
      6e6,
      true,
      false
    );

    assert.ok(result);
    assert.ok(result.tests.length == 7);
  });
  
  it('Requires object keys.', () => {
    let result = fastFuzz(
      simple,
      './test/sut/simple.js',
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
    assert.ok(result.tests.length == 7);
  });
    
  it('Slices objects.', () => {
    let result = fastFuzz(
      simple,
      './test/sut/simple.js',
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
    assert.ok(result.tests.length == 7);
  });
})
