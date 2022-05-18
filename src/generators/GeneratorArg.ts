import { mock } from "../intermock/build/index";
import { Limits } from "../utils/limits";
import { Generator } from "./Generator";

export class GeneratorArg extends Generator {
  private interfaces: [string, string][];

  constructor(interfaces: [string, string][]) {
    super(0, new Limits({}), [], 0);

    // Create the interfaces for each type, excluding IFuzzArgs(TODO?).
    this.interfaces = interfaces;
  }

  generate(count: number): any[] {
    return mock({
      files: this.interfaces,
      interfaces: ['IFuzzArgs'],
      isOptionalAlwaysEnabled: true,
      output: 'object',
      count: count
    })['IFuzzArgs'];
  }

  next(): any {
    return Generator.next(this);
  }

}