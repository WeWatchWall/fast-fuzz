// @ts-nocheck
const FlatPromise = require("flat-promise");
import { Fuzz } from '../../src';

export class Simple_Instance {
  @Fuzz.prop("string") name: string;
  @Fuzz.prop("integer") age: number;
  @Fuzz.prop("integer") code: number;
  
  @Fuzz.method
  public simple_instance_simple (
    @Fuzz.arg("integer") age: number
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

  @Fuzz.method
  public simple_instance_regular (
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
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

  @Fuzz.method
  public async simple_instance_IAsync(
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
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

  @Fuzz.method
  public async simple_instance_async(
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
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