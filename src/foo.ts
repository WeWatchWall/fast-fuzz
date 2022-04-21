import { Transform } from "class-transformer";
import { Direction } from "./direction";

export class Foo {
  name: string;
  readonly age: number;
  student: boolean;
  @Transform(direction => direction.value.value)
  direction: Direction;

  constructor(init: Partial<Foo>) {
    Object.assign(this, init);
  }

  public isSame(name: string, age: number, direction: Direction): boolean { 
    if (this.student && age === this.age) {
      if (name === this.name) {
        return false;
      }
    } else if (direction === Direction.Left) {
      if (age === this.age && name === this.name) {
        return false;
      }
    }
    return true;
  }
}