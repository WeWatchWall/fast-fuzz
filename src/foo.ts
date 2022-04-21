import { Expose } from 'class-transformer';
import { Direction } from "./direction";

export class Foo {
  name: string;
  readonly age: number;
  student: boolean;
  // @Transform(direction => Direction[direction.value])
  @Expose()
  direction: Direction;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
    this.student = true;
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