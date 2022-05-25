import { Limits } from "../utils/limits";
import { Generator } from "./Generator";
import { Mode } from "./Mode";

export class GeneratorDate extends Generator {
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
      new Limits({ date: { min, max } }),
      Generator.getLiterals('date', literals),
      index
    );
    this.falsyLiterals = this.falsyLiterals.concat([
      new Date(0),
      new Date(Date.parse('0')),
      new Date(-8640e12),
      new Date(8640e12)
    ]);
  }

  generate(count: number): Date[] {
    const result: any[] = [];

    if (Generator.mode === Mode.Falsy) {
      for (let index = 0; index < count; index++) {
        result.push(
          this.falsyLiterals[
            Generator.getRandomIndex(this.falsyLiterals.length)
          ]
        );
      }
    } else if (Generator.mode === Mode.Stuff && this.literals.length > 0) {
      for (let index = 0; index < count; index++) {
        if (Math.random() > Generator.P_FALSY) {
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
    } else {
      const [min, max]: [number, number] = GeneratorDate.getLimits(
        Generator.mode,
        this.limits.date.min,
        this.limits.date.max
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

        result.push(new Date(Generator.getRandomInt(min, max)));
      }
    }

    return result;
  }

  next(): any {
    return Generator.next(this).result;
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
          min + diff * GeneratorDate.MODE_SCALE * 1.5,
          max - diff * GeneratorDate.MODE_SCALE * 1.5
        ];
      case Mode.Low_2:
        return [
          min + diff * GeneratorDate.MODE_SCALE,
          max - diff * GeneratorDate.MODE_SCALE
        ];
      case Mode.Medium:
        return [min, max];
      case Mode.High_1:
        return [
          min - diff * GeneratorDate.MODE_SCALE * 4,
          max + diff * GeneratorDate.MODE_SCALE * 4
        ];
      case Mode.High_2:
        return [
          min - diff * GeneratorDate.MODE_SCALE * 40,
          max + diff * GeneratorDate.MODE_SCALE * 40
        ];
    }
  }
}