import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorFloat extends Generator {
  private static MODE_SCALE = 0.25;

  constructor(dimension = 0, literals: string[], min?: number, max?: number, index?: number) {
    super(
      dimension,
      new Limits({ float: { min, max } }),
      Generator.getLiterals('float', literals),
      index
    );
    this.falsyLiterals = this.falsyLiterals.concat([0, -0, Number.MIN_VALUE, -1 * Number.MIN_VALUE, NaN]);
    this.literals = this.literals.concat(this.falsyLiterals);
  }

  generate(count: number): number[] {
    const result: any[] = [];

    switch (Generator.mode) {
      case Mode.Falsy:
        for (let index = 0; index < count; index++) {
          result.push(this.falsyLiterals[Generator.getRandomIndex(this.falsyLiterals.length)]);
        }
        break;
      case Mode.Stuff:
        for (let index = 0; index < count; index++) {
          result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
        }
        break;
      default:
        const [min, max]: [number, number] = GeneratorFloat.getLimits(
          Generator.mode,
          this.limits.float.min,
          this.limits.float.max
        );

        for (let index = 0; index < count; index++) {
          if (Math.random() > Generator.P_STUFF_FALSY) { 
            result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
            continue;
          }

          result.push(GeneratorFloat.getRandomFloat(min, max));
        }
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this);
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   */
  static getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Gets limits based on mode.
   * @param mode 
   * @param min 
   * @param max 
   * @returns limits 
   */
   private static getLimits(mode: Mode, min: number, max: number): [number, number] {
    const diff = max - min;

    switch (mode) {
      case Mode.Falsy:
      case Mode.Stuff:
      case Mode.Low_1:
        return [
          min + diff * GeneratorFloat.MODE_SCALE * 1.5,
          max - diff * GeneratorFloat.MODE_SCALE * 1.5
        ];
      case Mode.Low_2:
        return [
          min + diff * GeneratorFloat.MODE_SCALE,
          max - diff * GeneratorFloat.MODE_SCALE
        ];
      case Mode.Medium:
        return [min, max];
      case Mode.High_1:
        return [
          min - diff * GeneratorFloat.MODE_SCALE * 4,
          max + diff * GeneratorFloat.MODE_SCALE * 4
        ];
      case Mode.High_2:
        return [
          min - diff * GeneratorFloat.MODE_SCALE * 40,
          max + diff * GeneratorFloat.MODE_SCALE * 40
        ];
    }
  }
}