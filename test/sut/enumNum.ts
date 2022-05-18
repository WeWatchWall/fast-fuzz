import { Fuzz } from "../../src/fast-fuzz";

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

export enum Direction_Default {
  Up,
  Down,
  Left,
  Right,
}

export enum Direction_Auto {
  Up = 1,
  Down,
  Left,
  Right,
}

export class Enum_Num {

  @Fuzz.method
  public static enum_num_default(
    @Fuzz.argType('Direction_Default')
    arg: Direction_Default
  ): string {
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

  @Fuzz.method
  public static enum_num_auto(
    @Fuzz.argType('Direction_Auto')
    arg: Direction_Auto
  ): string {
    /* #region  Falsy values */
    if (arg === undefined) {
      return `Undefined: ${arg}`;
    } else if (arg === null) {
      return `Null: ${arg}`;
    } else if (Number.isNaN(arg)) {
      return `NaN: ${arg}`;
    } else if (arg === literals.nil) {
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
      return `Direction.Up: ${arg}`;
    } else if (arg === literals.n2) {
      return `Direction.Down: ${arg}`;
    } else if (arg === literals.n3) {
      return `Direction.Left: ${arg}`;
    } else if (arg === literals.n4) {
      return `Direction.Right: ${arg}`;

    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }
}