const FlatPromise = require("flat-promise");
import {
  fuzzArg,
  fuzzMethod,
  fuzzProp
} from "../../src/fast-fuzz";

const AGE_17 = 17;
const AGE_22 = 22;
const CODE_7 = 7;
const CODE_10 = 10;

export class Regular_Instance {
  @fuzzProp("string") name: string;
  @fuzzProp("integer") age: number;
  @fuzzProp("integer") code: number;
  
  @fuzzMethod
  public regular_instance_simple (
    @fuzzArg("integer") _age: number
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
  public regular_instance_regular (
    @fuzzArg("string") _name: string,
    @fuzzArg("integer") _age: number,
    @fuzzArg("integer") _code: number
  ): boolean {
    if (this.code == CODE_7) {
      if (this.name == 'Bob') {
        return false;
      }
    } else if (this.code == CODE_10) {
      if (this.age == AGE_22 && this.name == 'Alice') {
        return false;
      }
    }
    return true;
  }

  @fuzzMethod
  public async regular_instance_IAsync(
    @fuzzArg("string") _name: string,
    @fuzzArg("integer") _age: number,
    @fuzzArg("integer") _code: number
  ): Promise<boolean> {
    if (this.code == CODE_7) {
      if (this.name == 'Bob') {
        return false;
      }
    } else if (this.code == CODE_10) {
      if (this.age == AGE_22 && this.name == 'Alice') {
        return false;
      }
    }
    return true;
  }

  @fuzzMethod
  public async regular_instance_async(
    @fuzzArg("string") _name: string,
    @fuzzArg("integer") _age: number,
    @fuzzArg("integer") _code: number
  ): Promise<boolean> {
    const flatPromise = new FlatPromise();

    setTimeout(() => {
      if (this.code == CODE_7) {
        if (this.name == 'Bob') {
          flatPromise.resolve(false);
        }
      } else if (this.code == CODE_10) {
        if (this.age == AGE_22 && this.name == 'Alice') {
          flatPromise.resolve(false);
        }
      }
      flatPromise.resolve(true);
    }, 1);
  
    return await flatPromise.promise;
  }
}