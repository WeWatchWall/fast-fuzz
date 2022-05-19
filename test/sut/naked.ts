export class Naked {
  age: number;

  public naked_instance (): string {
    if (this.age === undefined) {
      return `Undefined: ${this.age}`;
    } else if (this.age === null) {
      return `Null: ${this.age}`;
    }

    switch (this.age) {
      case 22:
        return `Branch 1: ${JSON.stringify(this.age)}`;
      case 17:
        return `Branch 2: ${JSON.stringify(this.age)}`;
      default:
        break;
    }
    return `Branch 0: ${JSON.stringify(this.age)}`;
  }

  public static naked_static (
    age: number
  ): string {
    if (age === undefined) {
      return `Undefined: ${age}`;
    } else if (age === null) {
      return `Null: ${age}`;
    }

    switch (age) {
      case 22:
        return `Branch 1: ${JSON.stringify(age)}`;
      case 17:
        return `Branch 2: ${JSON.stringify(age)}`;
      default:
        break;
    }
    return `Branch 0: ${JSON.stringify(age)}`;
  }

}