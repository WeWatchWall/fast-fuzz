const FlatPromise = require("flat-promise");
import {
  fuzzArg,
  fuzzMethod
} from "../../src/fast-fuzz";

export class Simple_Static {
  
  @fuzzMethod
  public static simple_static_simple (
    @fuzzArg("integer") age: number
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

  @fuzzMethod
  public static simple_static_regular (
    @fuzzArg("string") name: string,
    @fuzzArg("integer") age: number,
    @fuzzArg("integer") code: number
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

  @fuzzMethod
  public static async simple_static_IAsync(
    @fuzzArg("string") name: string,
    @fuzzArg("integer") age: number,
    @fuzzArg("integer") code: number
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

  @fuzzMethod
  public static async simple_static_async(
    @fuzzArg("string") name: string,
    @fuzzArg("integer") age: number,
    @fuzzArg("integer") code: number
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