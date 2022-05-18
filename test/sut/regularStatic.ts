// @ts-nocheck
const FlatPromise = require("flat-promise");
import { Fuzz } from '../../src/fast-fuzz';

const AGE_17: number = 17;
const AGE_22: number = 22;
const CODE_7: number = 7;
const CODE_10: number = 10;

export class Regular_Static {
  
  @Fuzz.method
  public static regular_static_simple (
    @Fuzz.arg("integer") age: number
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
  public static regular_static_regular (
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
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

  @Fuzz.method
  public static async regular_static_IAsync(
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
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

  // @Fuzz.method
  // public static async regular_static_async(
  //   @Fuzz.arg("string") name: string,
  //   @Fuzz.arg("integer") age: number,
  //   @Fuzz.arg("integer") code: number
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