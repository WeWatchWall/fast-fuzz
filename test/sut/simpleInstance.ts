const FlatPromise = require("flat-promise");
import {
  fuzzArg,
  fuzzMethod,
  fuzzProp
} from "../../src/fast-fuzz";

export class Simple_Instance {
  @fuzzProp("string") name: string;
  @fuzzProp("integer") age: number;
  @fuzzProp("integer") code: number;
  
  @fuzzMethod
  public simple_instance_simple (
    @fuzzArg("integer") _age: number
  ): boolean {
    switch (this.age) {
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
  public simple_instance_regular (
    @fuzzArg("string") _name: string,
    @fuzzArg("integer") _age: number,
    @fuzzArg("integer") _code: number
  ): boolean {
    if (this.code == 7) {
      if (this.name == 'Bob') {
        return false;
      }
    } else if (this.code == 10) {
      if (this.age == 22 && this.name == 'Alice') {
        return false;
      }
    }
    return true;
  }

  @fuzzMethod
  public async simple_instance_IAsync(
    @fuzzArg("string") _name: string,
    @fuzzArg("integer") _age: number,
    @fuzzArg("integer") _code: number
  ): Promise<boolean> {
    if (this.code == 7) {
      if (this.name == 'Bob') {
        return false;
      }
    } else if (this.code == 10) {
      if (this.age == 22 && this.name == 'Alice') {
        return false;
      }
    }
    return true;
  }

  @fuzzMethod
  public async simple_instance_async(
    @fuzzArg("string") _name: string,
    @fuzzArg("integer") _age: number,
    @fuzzArg("integer") _code: number
  ): Promise<boolean> {
    const flatPromise = new FlatPromise();

    setTimeout(() => {
      if (this.code == 7) {
        if (this.name == 'Bob') {
          flatPromise.resolve(false);
        }
      } else if (this.code == 10) {
        if (this.age == 22 && this.name == 'Alice') {
          flatPromise.resolve(false);
        }
      }
      flatPromise.resolve(true);
    }, 1);
  
    return await flatPromise.promise;
  }
}