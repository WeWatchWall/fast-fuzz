// @ts-nocheck
const FlatPromise = require("flat-promise");
import { Fuzz } from '../../src';

export class Test_Static {
  
  @Fuzz.method
  public static static_simple (
    @Fuzz.arg("integer") age: number
  ): boolean {

    switch (age) {
      case 22:
        return false;
      case 17:
        return false;
      default:
        break;
    }
    return true;
  }

  
  @Fuzz.method
  public static static_regular (
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
  ): boolean {
    if (code == 7) {
      if (name == 'Bob') {
        return false;
      }
    } else if (code == 10) {
      if (age == 22 && name == 'Alice') {
        return false;
      }
    }
  
    return true;
  }

  @Fuzz.method
  public static async static_IAsync(
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
  ): Promise<boolean> {
    if (code == 7) {
      if (name == 'Bob') {
        return false;
      }
    } else if (code == 10) {
      if (age == 22 && name == 'Alice') {
        return false;
      }
    }
    return true;
  }

  @Fuzz.method
  public static async static_async(
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
  ): Promise<boolean> {
    const flatPromise = new FlatPromise();

    setTimeout(() => {
      if (code == 7) {
        if (name == 'Bob') {
          flatPromise.resolve(false);
        }
      } else if (code == 10) {
        if (age == 22 && name == 'Alice') {
          flatPromise.resolve(false);
        }
      }
      flatPromise.resolve(true);
    }, 1);
  
    return await flatPromise.promise;
  }
}