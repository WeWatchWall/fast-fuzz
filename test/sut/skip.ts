import { Fuzz } from '../../src';

const AGE_17: number = 17;
const AGE_22: number = 22;

export class Skip {
  @Fuzz.prop("string") prop_1: string;
  @Fuzz.skipProp age: number;
  @Fuzz.prop("integer", 0, 5, 10) code: number;

  @Fuzz.method
  public skip_instance_simple (
    @Fuzz.arg("integer", 0, 15, 25) _age: number
  ): boolean {

    switch (this.age) {
      case AGE_22:
        return false;
      case AGE_17:
        return false;
      default:
        break;
    }
    return true;
  }

  @Fuzz.method
  public static skip_static_simple(
    @Fuzz.arg("string") _name: string,
    @Fuzz.skipArg age: number,
    @Fuzz.arg("integer", 0, 5, 10) _code: number
  ): boolean {

    switch (age) {
      case AGE_22:
        return false;
      case AGE_17:
        return false;
      default:
        break;
    }
    return true;
  }

  @Fuzz.skipMethod
  public static skip_static_skip(
    @Fuzz.arg("string") _name: string,
    @Fuzz.skipArg age: number,
    @Fuzz.arg("integer", 0, 5, 10) _code: number
  ): boolean {

    switch (age) {
      case AGE_22:
        return false;
      case AGE_17:
        return false;
      default:
        break;
    }
    return true;
  }

  @Fuzz.method
  public static skip_static_all(
    @Fuzz.skipArg _name: string,
    @Fuzz.skipArg age: number,
    @Fuzz.skipArg _code: number
  ): boolean {

    switch (age) {
      case AGE_22:
        return false;
      case AGE_17:
        return false;
      default:
        break;
    }
    return true;
  }
}