const execShellCommand = require("../execShellCommand.js");
import { assert } from 'chai';

describe('Get all fuzzing results.', function () {
  this.timeout(6 * 60 * 1e3);

  before(async () => {
    global.fastFuzzResults = await execShellCommand(`node ./dist/src/bin.js -i "./test/sut" -s "./" -d "../../dist/test/sut" -c "Test" -q true -t 3e3 -n 1e5`);
  });

  describe('Static methods.', function () {

    it('Fuzz simple method', async () => {
      let results: any[];
      let error: any;

      try {
        results = JSON.parse(global.fastFuzzResults);
      } catch (e: any) {
        error = e;
      }
      assert.ok(error === undefined);

      const method = results.find((result: any) => result.name === 'static_simple');
      assert.ok(method !== undefined);
      assert.ok(method.results.length === 3);
    });

    it('Fuzz regular method', async () => {
      let results: any[];
      let error: any;

      try {
        results = JSON.parse(global.fastFuzzResults);
      } catch (e: any) {
        error = e;
      }
      assert.ok(error === undefined);

      const method = results.find((result: any) => result.name === 'static_regular');
      assert.ok(method !== undefined);
      assert.ok(method.results.length === 4);
    });

    it('Fuzz async interface', async () => {
      let results: any[];
      let error: any;

      try {
        results = JSON.parse(global.fastFuzzResults);
      } catch (e: any) {
        error = e;
      }
      assert.ok(error === undefined);

      const method = results.find((result: any) => result.name === 'static_IAsync');
      assert.ok(method !== undefined);
      assert.ok(method.results.length === 4);
    });

    
    it('Fuzz async method', async () => {
      let results: any[];
      let error: any;

      try {
        results = JSON.parse(global.fastFuzzResults);
      } catch (e: any) {
        error = e;
      }
      assert.ok(error === undefined);

      const method = results.find((result: any) => result.name === 'static_async');
      assert.ok(method !== undefined);
      assert.ok(method.results.length === 4);
    });
  });

  
  describe('Instance methods.', function () {

    it('Fuzz simple method', async () => {
      let results: any[];
      let error: any;

      try {
        results = JSON.parse(global.fastFuzzResults);
      } catch (e: any) {
        error = e;
      }
      assert.ok(error === undefined);

      const method = results.find((result: any) => result.name === 'instance_simple');
      assert.ok(method !== undefined);
      assert.ok(method.results.length === 1);
    });

    it('Fuzz regular method', async () => {
      let results: any[];
      let error: any;

      try {
        results = JSON.parse(global.fastFuzzResults);
      } catch (e: any) {
        error = e;
      }
      assert.ok(error === undefined);

      const method = results.find((result: any) => result.name === 'instance_regular');
      assert.ok(method !== undefined);
      assert.ok(method.results.length === 2);
    });

    it('Fuzz async interface', async () => {
      let results: any[];
      let error: any;

      try {
        results = JSON.parse(global.fastFuzzResults);
      } catch (e: any) {
        error = e;
      }
      assert.ok(error === undefined);

      const method = results.find((result: any) => result.name === 'instance_IAsync');
      assert.ok(method !== undefined);
      assert.ok(method.results.length === 2);
    });

    
    it('Fuzz async method', async () => {
      let results: any[];
      let error: any;

      try {
        results = JSON.parse(global.fastFuzzResults);
      } catch (e: any) {
        error = e;
      }
      assert.ok(error === undefined);

      const method = results.find((result: any) => result.name === 'instance_async');
      assert.ok(method !== undefined);
      assert.ok(method.results.length === 2);
    });
  });
});