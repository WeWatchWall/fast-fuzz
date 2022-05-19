// const FlatPromise = require("flat-promise");
import {
  fuzzArg,
  fuzzMethod
} from "../../src/fast-fuzz";

const AGE_17 = 17;
const AGE_22 = 22;
const CODE_7 = 7;
const CODE_10 = 10;

export class Regular_Static {
  
  @fuzzMethod
  public static regular_static_simple (
    @fuzzArg("integer") age: number
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
  public static regular_static_regular (
    @fuzzArg("string") name: string,
    @fuzzArg("integer") age: number,
    @fuzzArg("integer") code: number
  ): boolean {
    if (code == CODE_7) {
      if (name == 'Bob') {
        return false;
      }
    } else if (code == CODE_10) {
      if (age == AGE_22 && name == 'Alice') {
        return false;
      }
    }
  
    return true;
  }

  @fuzzMethod
  public static async regular_static_IAsync(
    @fuzzArg("string") name: string,
    @fuzzArg("integer") age: number,
    @fuzzArg("integer") code: number
  ): Promise<boolean> {
    if (code == CODE_7) {
      if (name == 'Bob') {
        return false;
      }
    } else if (code == CODE_10) {
      if (age == AGE_22 && name == 'Alice') {
        return false;
      }
    }
    return true;
  }

  // @fuzzMethod
  // public static async regular_static_async(
  //   @fuzzArg("string") name: string,
  //   @fuzzArg("integer") age: number,
  //   @fuzzArg("integer") code: number
  // ): Promise<boolean> {
  //   const flatPromise = new FlatPromise();

  //   setTimeout(() => {
  //     if (code == CODE_7) {
  //       if (name == 'Bob') {
  //         flatPromise.resolve(false);
  //       }
  //     } else if (code == CODE_10) {
  //       if (age == AGE_22 && name == 'Alice') {
  //         flatPromise.resolve(false);
  //       }
  //     }
  //     flatPromise.resolve(true);
  //   }, 1);
  
  //   return await flatPromise.promise;
  // }
}