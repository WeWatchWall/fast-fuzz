import {
  fuzzArg,
  fuzzMethod,
  fuzzProp,
  fuzzSkipArg,
  fuzzSkipProp,
  fuzzSkipMethod
} from "../../src/fast-fuzz";

const AGE_17 = 17;
const AGE_22 = 22;

export class Skip {
  @fuzzProp("string") prop_1: string;
  @fuzzSkipProp age: number;
  @fuzzProp("integer", 0, 5, 10) code: number;

  private private_prop;

  @fuzzMethod
  public skip_instance_simple (
    @fuzzArg("integer", 0, 15, 25) _age: number
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

  @fuzzMethod
  public static skip_static_simple(
    @fuzzArg("string") _name: string,
    @fuzzSkipArg age: number,
    @fuzzArg("integer", 0, 5, 10) _code: number
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

  @fuzzSkipMethod
  public static skip_static_skip(
    @fuzzArg("string") _name: string,
    @fuzzSkipArg age: number,
    @fuzzArg("integer", 0, 5, 10) _code: number
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

  @fuzzMethod
  public static skip_static_all(
    @fuzzSkipArg _name: string,
    @fuzzSkipArg age: number,
    @fuzzSkipArg _code: number
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

  @fuzzSkipMethod
  public skip_instance_skip(
    @fuzzSkipArg _name: string,
    @fuzzSkipArg _age: number,
    @fuzzSkipArg _code: number
  ): boolean {
    this.private_prop = 1;

    switch (this.private_prop === 1 && this.age) {
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