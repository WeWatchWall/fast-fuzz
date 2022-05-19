import { plainToInstance } from "class-transformer";
import { mock } from "../intermock/build/index";
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
  private isIgnoreFalsy: boolean;

  constructor(type: ModuleType, dimension = 0, index?: number, mode?: Mode, isIgnoreFalsy = false) {
    // Create the interfaces for each type, excluding IFuzzArgs(TODO?).
    if (GeneratorType.interfaces === undefined) {
      GeneratorType.interfaces = Object.values(Globals.codeUtil.interfaces);
    }

    super(dimension, new Limits({}), [], index);
    this.falsyLiterals = this.falsyLiterals.concat([{}]);
    
    this.typeArgs = type.extends;
    this.types = [];

    this.mode = mode === undefined ? Generator.mode : mode;
    this.isIgnoreFalsy = isIgnoreFalsy;
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
          this.generateSingle(this.typeArgs[0], this.types[0], count, result);
        } else {
          this.generateMany(count, result);
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

  private generateSingle(typeArg: ModuleType, type: any, count: number, resultsOut: any[]): void {

    const iResults: any = mock({
      files: GeneratorType.interfaces,
      interfaces: [typeArg.name],
      isOptionalAlwaysEnabled: true,
      output: 'object',
      count
    })[typeArg.name];

    for (let index = 0; index < count; index++) {
      if (!this.isIgnoreFalsy && Math.random() > Generator.P_FALSY) {
        resultsOut.push(this.falsyLiterals[Generator.getRandomIndex(this.falsyLiterals.length)]);
        continue;
      }
  
      resultsOut.push(
        plainToInstance(
          type,
          iResults[index],
          {
            enableImplicitConversion: true
          }
        )
      );
    }
  }

  private generateMany(count: number, resultsOut: any[]): void {
    const countPerType: number = Math.floor(count / this.numTypes);

    for (let index = 0; index < this.numTypes; index++) {
      this.generateSingle(
        this.typeArgs[index],
        this.types[index],
        countPerType,
        resultsOut
      );
    }

    GeneratorType.shuffle(resultsOut);
  }

  /**
   * Shuffles an array in-place.
   * @param array 
   */
  private static shuffle(array: any[]): void {
    let
      currentIndex = array.length,
      randomIndex: number;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] =
        [array[randomIndex], array[currentIndex]];
    }
  }
}