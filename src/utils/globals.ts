import { Code } from "./code";

/**
 * Globals to communicate accross the test environment.
 */
export namespace Globals {
  export var isTest: boolean = false;
  export var codeUtil: Code;
}