export namespace Limits {
  export const int: {
    min: number,
    max: number
  } = {
    min: -5,
    max: 5
  };

  export const float: {
    min: number,
    max: number
  } = {
    min: -1,
    max: 2
  };

  export const date: {
    min: number,
    max: number
  } = {
    min: Date.now() - 8.64e+7,
    max: Date.now() + 8.64e+7
  };

  export const string: {
    min: number,
    max: number
  } = {
    min: 0,
    max: 4
  };
}