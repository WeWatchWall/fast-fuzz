export class Limits {
  int: { min?: number, max?: number };
  float: { min?: number, max?: number };
  date: { min?: number, max?: number };
  string: { min?: number, max?: number };
  array: { min?: number, max?: number };

  constructor(init: Partial<Limits>) {
    // Fill in every argument.
    const arg: Partial<Limits> = {};
    for (const key in init) {
      const argValue: { min?: number, max?: number } = {};
      Object.assign(argValue, Limits.defaults[key], init[key]);

      // Set any limits that are invalid if they are negative.
      if (
        key === 'date' ||
        key === 'string' ||
        key === 'array'
      ) {
        argValue.min = Math.max(argValue.min, 0);
      }

      // Sanity check for max less than the default min.
      // Update with a sensible max if it is not set.
      // The date is a special case where the value is absolute.
      if (key !== 'date' && argValue.max <= argValue.min) {
        argValue.max = argValue.min + Limits.defaults[key].max;
      } else if (key === 'date' && argValue.max <= argValue.min) {
        argValue.max = argValue.min + 8.64e+7;
      }

      // Copy the limit to the partial keys.
      arg[key] = argValue;
    }

    // Fill in any keys not in the partial keys.
    Object.assign(this, Limits.defaults, arg);
  }

  private static defaults: {
    int: { min: number, max: number },
    float: { min: number, max: number },
    date: { min: number, max: number },
    string: { min: number, max: number },
    array: { min: number, max: number }
  } = {
    int: { min: -5, max: 5 },
    float: { min: -1, max: 2 },
    date: { min: Date.now() - 8.64e+7, max: Date.now() + 8.64e+7 },
    string: { min: 1, max: 4 },
    array: { min: 0, max: 3 }
  };
}