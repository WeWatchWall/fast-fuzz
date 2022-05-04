import { plainToInstance } from "class-transformer";
import { mock } from "intermock";
import { Globals } from "../utils/globals";
import { Limits } from "../utils/limits";
import { ModuleType } from "../utils/modules";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorType extends Generator {
  private static interfaces: [string, string][];  

  private typeArgs: ModuleType[];
  private types: any[];
  private numTypes?: number;

  private mode: Mode;

  constructor(type: ModuleType, dimension = 0, index?: number, mode?: Mode) {
    // Create the interfaces for each type, excluding IFuzzArgs(TODO?).
    if (GeneratorType.interfaces === undefined) {
      GeneratorType.interfaces = Object.values(Globals.codeUtil.interfaces);
    }

    super(dimension, new Limits({}), [], index);
    this.falsyLiterals = this.falsyLiterals.concat([{}]);
    
    this.typeArgs = type.extends;
    this.types = [];

    this.mode = mode === undefined ? Generator.mode : mode;
  }

  generate(count: number): any[] {
    const result: any[] = [];

    this.init();
  
    switch (this.mode) {
      case Mode.Falsy:
        for (let index = 0; index < count; index++) {
          result.push(this.falsyLiterals[Generator.getRandomIndex(this.falsyLiterals.length)]);
        }
        break;
      default:
        if (this.numTypes < 2) {
          for (let index = 0; index < count; index++) {
            result.push(this.generateSingle(this.typeArgs[0], this.types[0]));
          }
        } else {
          for (let index = 0; index < count; index++) {
            result.push(this.generateMany());
          }
        }
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this);
  }

  private init(): void {
    if (this.types.length > 0) { return; }

    this.typeArgs.forEach((typeArg: ModuleType) => {
      this.types.push(Generator.getType(typeArg));
    });
    this.numTypes = this.typeArgs.length;
  }

  private generateSingle(typeArg: ModuleType, type: any): any {
    let result: any = mock({
      files: GeneratorType.interfaces,
      interfaces: [typeArg.name],
      isOptionalAlwaysEnabled: true,
      output: 'object'
    });

    result = plainToInstance(
      type,
      result[typeArg.name],
      {
        enableImplicitConversion: true
      }
    );

    return result;
  }

  private generateMany(): any {
    const typeIndex = Generator.getRandomIndex(this.numTypes);
    return this.generateSingle(this.typeArgs[typeIndex], this.types[typeIndex])
  }
}