export declare interface Direction {
  value: 1 | 2 | 3 | "UP"
}

export declare interface Foo {
    name: string;
    readonly age: number;
    student: boolean;
    direction: Direction;
    constructor(init: Partial<Foo>);
    isSame(name: string, age: number, direction: Direction): boolean;
}
