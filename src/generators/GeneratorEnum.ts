import { Limits } from "../utils/limits";
import { ModuleType } from "../utils/modules";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorEnum extends Generator {
  private type: ModuleType;
  private renderer: IntEnumRender | DictionaryEnumRender;
  private isInit: boolean;

  constructor(type: ModuleType, dimension = 0, index?: number) {
    super(dimension, new Limits({}), [], index);
    this.falsyLiterals = this.falsyLiterals.concat([
      NaN, 0, -0,
      Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER,
      -1 * Number.MIN_VALUE, Number.MIN_VALUE,
      -1 * Number.MAX_VALUE, Number.MAX_VALUE,
      Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY,
      '', 'RkeRxOSF4BfSpgc5Dc7hGumMO'
    ]);
    this.type = type;
    this.isInit = false;
  }

  generate(count: number): any[] {
    let result: any[] = [];

    this.init();

    switch (Generator.mode) {
      case Mode.Falsy:
        for (let index = 0; index < count; index++) {
          result.push(this.falsyLiterals[Generator.getRandomIndex(this.falsyLiterals.length)]);
        }
        break;
      default:
        result = this.renderer.render(count, this.falsyLiterals);
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this).result;
  }

  private init(): void {
    if (this.isInit) { return; }
    
    // Full integer enums are faster than lookup enums.
    const enumObject: any = Generator.getType(this.type);

    const numbers: number[] = [];
    const strings: string[] = [];

    Object.keys(enumObject).forEach((key: string) => {
      const numericKey = Number.parseInt(key);
      if (Number.isInteger(numericKey)) {
        numbers.push(numericKey);
      } else {
        strings.push(key);
      }
    });

    let isInteger: boolean;
    const min = numbers[0];
    let max = min;
    if (numbers.length === strings.length) {
      isInteger = true;
      numbers.forEach((key: number, index: number) => {
        if (key - min !== index) { isInteger = false; }
        max = key;
      });
    } else {
      isInteger = false;
    }

    if (isInteger) {
      this.renderer = new IntEnumRender(min, max);
    } else {
      const values = strings.map((value: string) => {
        // Check for numbers.
        const numValue = Number.parseFloat(value);
        if (!Number.isNaN(numValue)) {
          return numValue;
        }

        return enumObject[value];
      });
      this.renderer = new DictionaryEnumRender(values);
    }

    this.isInit = true;
  }
}

/**
 * Integer enum render.
 */
class IntEnumRender {
  private min: number;
  private max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  render(count: number, falsyLiterals: any[]): number[] {
    // Array of random integers.
    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      if (
        Math.random() > Generator.P_FALSY
      ) {
        results.push(
          falsyLiterals[
            Generator.getRandomIndex(falsyLiterals.length)
          ]
        );
        continue;
      }

      results.push(Generator.getRandomInt(this.min, this.max));
    }
    return results;
  }
}

/**
 * Dictionary enum render.
 */
class DictionaryEnumRender {
  private values: (string | number)[];
  private maxIndex: number;

  constructor(values: (string | number)[]) {
    this.values = values;
    this.maxIndex = this.values.length;
  }

  render(count: number, falsyLiterals: any[]): (string | number)[] {
    // Values from an array of random indices.
    const results: (number | string)[] = [];
    for (let i = 0; i < count; i++) {
      if (
        Math.random() > Generator.P_FALSY
      ) {
        results.push(
          falsyLiterals[
            Generator.getRandomIndex(falsyLiterals.length)
          ]
        );
        continue;
      }

      results.push(this.values[Generator.getRandomIndex(this.maxIndex)]);
    }
    return results;
  }
}