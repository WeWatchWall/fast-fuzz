import { Fuzz } from "../../src";

const literals = {
  nil: 0,
  m1: -1,
  emptyStr: '',
  longStr: 'RkeRxOSF4BfSpgc5Dc7hGumMO',
  n1: 1,
  n2: 2,
  n3: 3,
  n4: 4
};

export enum Direction_Array {
  Up,
  Down,
  Left,
  Right,
}

export class Enum_Num_Array {

  @Fuzz.method
  public static enum_num_array(
    @Fuzz.argType('Direction_Array', 1)
    argArray: Direction_Array[]
  ): string {

    switch (argArray) {
      case undefined:
        return `Undefined []: ${argArray}`;
      case null:
        return `Null []: ${argArray}`;
      default:
        break;
    }
    if (argArray.length === 0) {
      return `Empty []: ${JSON.stringify(argArray)}`;
    }

    const arg: Direction_Array = argArray[0];

    /* #region  Falsy values */
    if (arg === undefined) {
      return `Undefined: ${arg}`;
    } else if (arg === null) {
      return `Null: ${arg}`;
    } else if (Number.isNaN(arg)) {
      return `NaN: ${arg}`;
    } else if (arg === 0) {
      return `Zero: ${arg}`;
    } else if (arg === Number.MIN_SAFE_INTEGER) {
      return `Min int: ${arg}`;
    } else if (arg === Number.MAX_SAFE_INTEGER) {
      return `Max int: ${arg}`;
    } else if (arg === literals.m1 * Number.MIN_VALUE) {
      return `Negative min decimal: ${arg}`;
    } else if (arg === Number.MIN_VALUE) {
      return `Positive min decimal: ${arg}`;
    } else if (arg === literals.m1 * Number.MAX_VALUE) {
      return `Min float: ${arg}`;
    } else if (arg === Number.MAX_VALUE) {
      return `Max float: ${arg}`;
    } else if (arg === Number.NEGATIVE_INFINITY) {
      return `Negative infinity: ${arg}`;
    } else if (arg === Number.POSITIVE_INFINITY) {
      return `Positive infinity: ${arg}`;
    } else if (`${arg}` === literals.emptyStr) {
      return `Empty string: ${arg}`;
    } else if (`${arg}` === literals.longStr) {
      return `Long literal(25): ${arg}`;
    /* #endregion */

    } else if (arg === literals.n1) {
      return `Direction.Down: ${arg}`;
    } else if (arg === literals.n2) {
      return `Direction.Left: ${arg}`;
    } else if (arg === literals.n3) {
      return `Direction.Right: ${arg}`;

    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }

}