import { Fuzz } from "../../src/fast-fuzz";

const ints = {
  nil: 0,
  nHard: -210,
  nSoft: -30,
  nMin: -10,
  hard: 210,
  soft: 30,
  max: 10,
};

const floats = {
  nil: 0,
  nHard: -42,
  nSoft: -6,
  nMin: -2,
  hard: 42,
  soft: 6,
  max: 2,
};

const dates = {
  nil: 0,
  now: Date.now(),
  y2K: 946677600000,
  nHard: Date.now() - 3600e3 * 2 * 10,
  nSoft: Date.now() - 3600e3 * 2,
  nMin: Date.now() - 3600e3,
  hard: Date.now() + 3600e3 * 2 * 10,
  soft: Date.now() + 3600e3 * 2,
  max: Date.now() + 3600e3,
  dateMin: -8640e12,
  dateMax: 8640e12
};

const strings = {
  nil: 0,
  hard: 4,
  soft: 3,
  max: 2,
  long: 25
};

export class Builtins_Limit {

  @Fuzz.method
  public static builtin_int_limit(
    @Fuzz.arg('integer', 0, -10, 10) arg: number
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

  @Fuzz.method
  public static builtin_float_limit(
    @Fuzz.arg('float', 0, -2, 2) arg: number
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

  @Fuzz.method
  public static builtin_date_limit(
    @Fuzz.arg(
      'date',
      0,
      Date.now() - 3600e3,
      Date.now() + 3600e3
    )
    arg1: Date
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

  @Fuzz.method
  public static builtin_string_limit(
    @Fuzz.arg('string', 0, -1, 2) arg: string
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