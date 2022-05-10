import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

/**
 * Generator for strings. Just for stuffind or placeholders.
 * Not usually used in logic because of their combinatorial explosion.
 */
export class GeneratorString extends Generator {
  private static MODE_SCALE = 1;

  constructor(
    dimension = 0,
    literals: string[],
    min?: number,
    max?: number,
    index?: number
  ) {
    super(
      dimension,
      new Limits({ string: { min, max } }),
      Generator.getLiterals('string', literals),
      index
    );
    this.falsyLiterals = this.falsyLiterals.concat(['']);
  }

  generate(count: number): string[] {
    const result: any[] = [];

    switch (Generator.mode) {
      case Mode.Falsy:
        for (let index = 0; index < count; index++) {
          result.push(
            this.falsyLiterals[
              Generator.getRandomIndex(this.falsyLiterals.length)
            ]
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
        const [min, max]: [number, number] = GeneratorString.getLimits(
          Generator.mode,
          this.limits.string.min,
          this.limits.string.max
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
          } else if (random > 0.2 && this.literals.length > 0) {
            result.push(
              this.literals[Generator.getRandomIndex(this.literals.length)]
            );
            continue;
          }

          result.push(
            `${Math.random().toString(36)}00000000000000000`
            .slice(
              2,
              Generator.getRandomInt(min, max) + 2
            )
          );
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
    switch (mode) {
      case Mode.Falsy:
      case Mode.Stuff:
      case Mode.Low_1:
      case Mode.Low_2:
        return [
          Math.max(1, min + GeneratorString.MODE_SCALE),
          Math.max(2, max - GeneratorString.MODE_SCALE),
        ];
      case Mode.Medium:
        return [min, max];
      case Mode.High_1:
        return [
          Math.max(1, min - GeneratorString.MODE_SCALE),
          Math.max(2, max + GeneratorString.MODE_SCALE)
        ];
      case Mode.High_2:
        return [
          Math.max(1, min - GeneratorString.MODE_SCALE * 2),
          Math.max(2, max + GeneratorString.MODE_SCALE * 2)
        ];
    }
  }
}