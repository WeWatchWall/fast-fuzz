export declare interface Direction {
  Direction: 1 | 2 | 3 | "UP";
}

export declare interface A {
  a: number;
}

export declare interface B extends A {
  a: number;
  b: number;
}


export declare interface C extends A {
  a: number;
  c: number;
}

export declare interface Foo {
  name: string;
  readonly age: number;
  student: boolean;
  direction: Direction;
  constructor(init: Partial<Foo>);
  isSame(name: string, age: number, direction: Direction): boolean;
  inherit: [B, C];
}
