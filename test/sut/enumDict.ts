import { Fuzz } from "../../src";

const literals = {
  nil: 0,
  m1: -1,
  emptyStr: '',
  longStr: 'RkeRxOSF4BfSpgc5Dc7hGumMO',
  n1: 1,
  n2: 2,
  n3: 3,
  n4: 4,
  right: 'R'
};

export enum Direction_Num {
  Up,
  Down,
  Left = 3,
  Right,
}

export enum Direction_Mix {
  Up,
  Down,
  Left,
  Right = 'R',
}

export enum Direction_Mix_Num {
  Up,
  Down,
  Left = 3,
  Right = 'R',
}

export enum Direction_Mix_Auto {
  Up = 1,
  Down,
  Left,
  Right = 'R',
}

export class Enum_Dict {

  @Fuzz.method
  public static enum_dict_num(
    @Fuzz.argType('Direction_Num')
    arg: Direction_Num
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
    } else if (arg === literals.n3) {
      return `Direction.Left: ${arg}`;
    } else if (arg === literals.n4) {
      return `Direction.Right: ${arg}`;

    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }

  @Fuzz.method
  public static enum_dict_mix(
    @Fuzz.argType('Direction_Mix')
    arg: Direction_Mix
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
    } else if (arg === literals.right) {
      return `Direction.Right: ${arg}`;

    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }

  @Fuzz.method
  public static enum_dict_mix_num(
    @Fuzz.argType('Direction_Mix_Num')
    arg: Direction_Mix_Num
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
    } else if (arg === literals.n3) {
      return `Direction.Left: ${arg}`;
    } else if (arg === literals.right) {
      return `Direction.Right: ${arg}`;

    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }

  @Fuzz.method
  public static enum_dict_mix_auto(
    @Fuzz.argType('Direction_Mix_Auto')
    arg: Direction_Mix_Auto
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
    } else if (arg === literals.right) {
      return `Direction.Right: ${arg}`;

    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }
}