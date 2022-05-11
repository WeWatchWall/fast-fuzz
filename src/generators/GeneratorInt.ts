import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorInt extends Generator {
  private static MODE_SCALE = 0.25;

  constructor(
    dimension = 0,
    literals: string[],
    min?: number,
    max?: number,
    index?: number
  ) {
    super(
      dimension,
      new Limits({ int: { min, max } }),
      Generator.getLiterals('integer', literals),
      index
    );
    this.falsyLiterals = this.falsyLiterals.concat([
      NaN, 0, -0,
      Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER
    ]);
  }

  generate(count: number): number[] {
    const result: any[] = [];

    switch (Generator.mode) {
      case Mode.Falsy:
        for (let index = 0; index < count; index++) {
          result.push(this.falsyLiterals[
            Generator.getRandomIndex(this.falsyLiterals.length)]
          );
        }
        break;
      case Mode.Stuff:
        for (let index = 0; index < count; index++) {
          if (
            this.literals.length === 0 ||
            Math.random() > Generator.P_FALSY
          ) {
            result.push(
              this.falsyLiterals[
                Generator.getRandomIndex(this.falsyLiterals.length)
              ]
            );
            continue;
          }

          result.push(
            this.literals[Generator.getRandomIndex(this.literals.length)]
          );
        }
        break;
      default:
        const [min, max]: [number, number] = GeneratorInt.getLimits(
          Generator.mode,
          this.limits.int.min,
          this.limits.int.max
        );

        for (let index = 0; index < count; index++) {
          const random = Math.random(); 
          if (random > Generator.P_FALSY) {
            result.push(
              this.falsyLiterals[
                Generator.getRandomIndex(this.falsyLiterals.length)
              ]
            );
            continue;
          } else if (random > Generator.P_STUFF && this.literals.length > 0) {
            result.push(
              this.literals[Generator.getRandomIndex(this.literals.length)]
            );
            continue;
          }

          result.push(Generator.getRandomInt(min, max));
        }
        break;
    }

    return result;
  }

  next(): any {
    return Generator.next(this);
  }

  /**
   * Gets limits based on mode.
   * @param mode 
   * @param min 
   * @param max 
   * @returns limits 
   */
  private static getLimits(
    mode: Mode,
    min: number,
    max: number
  ): [number, number] {
    const diff = max - min;

    switch (mode) {
      case Mode.Falsy:
      case Mode.Stuff:
      case Mode.Low_1:
        return [
          min + diff * GeneratorInt.MODE_SCALE * 1.5,
          max - diff * GeneratorInt.MODE_SCALE * 1.5
        ];
      case Mode.Low_2:
        return [
          min + diff * GeneratorInt.MODE_SCALE,
          max - diff * GeneratorInt.MODE_SCALE
        ];
      case Mode.Medium:
        return [min, max];
      case Mode.High_1:
        return [
          min - diff * GeneratorInt.MODE_SCALE * 4,
          max + diff * GeneratorInt.MODE_SCALE * 4
        ];
      case Mode.High_2:
        return [
          min - diff * GeneratorInt.MODE_SCALE * 40,
          max + diff * GeneratorInt.MODE_SCALE * 40
        ];
    }
  }
}