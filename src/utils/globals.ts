import { Code } from "./code";

/**
 * Globals to communicate accross the test environment.
 */
export namespace Globals {
  export var codeUtil: Code;

  export var isTest: boolean = false;
  export var literals: string[] = [];
  export var methodCount: number = 0;
}