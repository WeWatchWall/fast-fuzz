import {
  fuzzArg,
  fuzzMethod
} from "../../src/fast-fuzz";

const ints = {
  nil: 0,
  nHard: -525,
  nSoft: -75,
  nMin: -25,
  hard: 525,
  soft: 75,
  max: 25,
};

const floats = {
  nil: 0,
  nHard: -210,
  nSoft: -30,
  nMin: -10,
  hard: 210,
  soft: 30,
  max: 10,
};

const dates = {
  nil: 0,
  now: Date.now(),
  y2K: 946677600000,
  nHard: Date.now() - 8.64e+7 * 2 * 10,
  nSoft: Date.now() - 8.64e+7 * 2,
  nMin: Date.now() - 8.64e+7,
  hard: Date.now() + 8.64e+7 * 2 * 10,
  soft: Date.now() + 8.64e+7 * 2,
  max: Date.now() + 8.64e+7,
  dateMin: -8640e12,
  dateMax: 8640e12
};

const strings = {
  nil: 0,
  hard: 6,
  soft: 5,
  max: 4,
  long: 25
};

export class Builtins_Default {

  @fuzzMethod
  public static builtin_bool_default(
    @fuzzArg('boolean') arg: boolean
  ): string {
    switch (arg) {
      case undefined:
        // TODO: This actually records null
        //   for the parameter prob. because of
        //   IstanbulJS hardcoded falsy value.
        return `Undefined: ${arg}`;
      case null:
        return `Null: ${arg}`;
      case false:
        return `False: ${arg}`;
      case true:
        return `True: ${arg}`;
      default:
        return `Unkown: ${arg}`;
    }
  }

  @fuzzMethod
  public static builtin_int_default(
    @fuzzArg('integer') arg: number
  ): string {
    if (arg === undefined) {
      return `Undefined: ${arg}`;
    } else if (arg === null) {
      return `Null: ${arg}`;
    } else if (Number.isNaN(arg)) {
      return `NaN: ${arg}`;
    } else if (arg === ints.nil) {
      return `Zero: ${arg}`;
    } else if (arg === Number.MIN_SAFE_INTEGER) {
      return `Min int: ${arg}`;
    } else if (arg === Number.MAX_SAFE_INTEGER) {
      return `Max int: ${arg}`;
    // Ignores this branch.
    } else if (arg < ints.nHard) {
      return `Min hard limit: ${arg}`;
    } else if (arg < ints.nSoft) {
      return `Min soft limit: ${arg}`;
    } else if (arg < ints.nMin) {
      return `Min limit: ${arg}`;
    } else if (arg < ints.nil) {
      return `Negative: ${arg}`;
    // Ignores this branch.
    } else if (arg > ints.hard) {
      return `Max hard limit: ${arg}`;
    } else if (arg > ints.soft) {
      return `Max soft limit: ${arg}`;
    } else if (arg > ints.max) {
      return `Max limit: ${arg}`;
    } else if (arg > ints.nil) {
      return `Positive: ${arg}`;
    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }

  @fuzzMethod
  public static builtin_float_default(
    @fuzzArg('float') arg: number
  ): string {
    if (arg === undefined) {
      return `Undefined: ${arg}`;
    } else if (arg === null) {
      return `Null: ${arg}`;
    } else if (Number.isNaN(arg)) {
      return `NaN: ${arg}`;
    } else if (arg === floats.nil) {
      return `Zero: ${arg}`;
    } else if (arg === -1 * Number.MIN_VALUE) {
      return `Negative min decimal: ${arg}`;
    } else if (arg === Number.MIN_VALUE) {
      return `Positive min decimal: ${arg}`;
    } else if (arg === -1 * Number.MAX_VALUE) {
      return `Min float: ${arg}`;
    } else if (arg === Number.MAX_VALUE) {
      return `Max float: ${arg}`;
    } else if (arg === Number.NEGATIVE_INFINITY) {
      return `Negative infinity: ${arg}`;
    } else if (arg === Number.POSITIVE_INFINITY) {
      return `Positive infinity: ${arg}`;
    // Ignores this branch.
    } else if (arg < floats.nHard) {
      return `Min hard limit: ${arg}`;
    } else if (arg < floats.nSoft) {
      return `Min soft limit: ${arg}`;
    } else if (arg < floats.nMin) {
      return `Min limit: ${arg}`;
    } else if (arg < floats.nil) {
      return `Negative: ${arg}`;
    // Ignores this branch.
    } else if (arg > floats.hard) {
      return `Max hard limit: ${arg}`;
    } else if (arg > floats.soft) {
      return `Max soft limit: ${arg}`;
    } else if (arg > floats.max) {
      return `Max limit: ${arg}`;
    } else if (arg > floats.nil) {
      return `Positive: ${arg}`;
    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }

  @fuzzMethod
  public static builtin_date_default(
    @fuzzArg('date') arg1: Date
  ): string {
    const arg: number = arg1?.getTime();

    if (arg1 === undefined) {
      return `Undefined: ${arg1}`;
    } else if (arg1 === null) {
      return `Null: ${arg1}`;
    } else if (Number.isNaN(arg)) {
      return `NaN: ${arg}`;
    } else if (arg === dates.nil) {
      return `Zero: ${arg}`;
    } else if (arg === dates.y2K) {
      return `Y2K: ${arg}`;
    } else if (arg === dates.dateMin) {
      return `Min date: ${arg}`;
    } else if (arg === dates.dateMax) {
      return `Max date: ${arg}`;
    // Ignores this branch.
    } else if (arg < dates.nHard) {
      return `Min hard limit: ${arg}`;
    } else if (arg < dates.nSoft) {
      return `Min soft limit: ${arg}`;
    } else if (arg < dates.nMin) {
      return `Min limit: ${arg}`;
    } else if (arg < dates.now) {
      return `Negative: ${arg}`;
    // Ignores this branch.
    } else if (arg > dates.hard) {
      return `Max hard limit: ${arg}`;
    } else if (arg > dates.soft) {
      return `Max soft limit: ${arg}`;
    } else if (arg > dates.max) {
      return `Max limit: ${arg}`;
    } else if (arg > dates.now) {
      return `Positive: ${arg}`;
    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }

  @fuzzMethod
  public static builtin_string_default(
    @fuzzArg('string') arg: string
  ): string {
    const len = arg?.length;

    if (arg === undefined) {
      return `Undefined: ${arg}`;
    } else if (arg === null) {
      return `Null: ${arg}`;
    } else if (len === strings.nil) {
      return `Zero: ${arg}`;
    } else if (len === strings.long) {
      return `Long literal(25): ${arg}`;
    // Ignores this branch.
    } else if (len > strings.hard) {
      return `Max hard limit: ${arg}`;
    } else if (len > strings.soft) {
      return `Max soft limit: ${arg}`;
    } else if (len > strings.max) {
      return `Max limit: ${arg}`;
    } else if (len > strings.nil) {
      return `Positive: ${arg}`;
    // Ignores this branch.
    } else {
      return `Unkown: ${arg}`;
    }
  }
}