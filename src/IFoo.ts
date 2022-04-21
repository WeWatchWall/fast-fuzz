import { Direction } from "./direction";
export declare interface Foo {
    name: string;
    readonly age: number;
    student: boolean;
    /** @mockType {random.objectElement({ "Up": 1, "Down": 2, "Left": 3, "Right": "UP" })} */
    direction: Direction;
    constructor(init: Partial<Foo>);
    isSame(name: string, age: number, direction: Direction): boolean;
}
