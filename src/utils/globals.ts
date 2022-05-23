import { Mode } from "../generators/Mode";
import { Code } from "./code";
import { ModuleType } from "./modules";

/**
 * Globals to communicate accross the test environment.
 */
export class Globals {
  static isTest = false;
  static codeUtil: Code;

  static literals: string[] = [];
  static methodCount = 0;
  static mode: Mode = Mode.Falsy;

  static instances: {
    args: any[],
    callTypes: {
      index: number,
      dimension: number,
      types: ModuleType[]
    }[]
  }[] = [];
}