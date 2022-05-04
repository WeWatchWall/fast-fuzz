import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorDate extends Generator {
  private static MODE_SCALE = 0.5;

  constructor(dimension: number = 0, literals: string[], min?: number, max?: number, index?: number) {
    super(
      dimension,
      new Limits({ date: { min, max } }),
      Generator.getLiterals('date', literals),
      index
    );
    this.falsyLiterals = this.falsyLiterals.concat([new Date(0), new Date(Date.parse('0'))]);
    this.literals = this.literals.concat(this.falsyLiterals);
  }

  generate(count: number): Date[] {
    let result: any[] = [];

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
        const [min, max]: [number, number] = GeneratorDate.getLimits(
          Generator.mode,
          this.limits.int.min,
          this.limits.int.max
        );

        for (let index = 0; index < count; index++) {
          if (Math.random() > Generator.P_STUFF_FALSY) { 
            result.push(this.literals[Generator.getRandomIndex(this.literals.length)]);
            continue;
          }

          result.push(new Date(Generator.getRandomInt(min, max)));
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
   private static getLimits(mode: Mode, min: number, max: number): [number, number] {
    const diff = max - min;

    switch (mode) {
      case Mode.Falsy:
      case Mode.Stuff:
      case Mode.Low:
        return [
          min + diff * GeneratorDate.MODE_SCALE,
          max - diff * GeneratorDate.MODE_SCALE
        ];
      case Mode.Medium:
        return [min, max];
      case Mode.High:
        return [
          8640e12,
          -8640e12
        ];
    }
  }
}