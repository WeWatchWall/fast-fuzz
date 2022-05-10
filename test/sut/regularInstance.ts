// @ts-nocheck
const FlatPromise = require("flat-promise");
import { Fuzz } from '../../src';

const AGE_17: number = 17;
const AGE_22: number = 22;
const CODE_7: number = 7;
const CODE_10: number = 10;

export class Regular_Instance {
  @Fuzz.prop("string") name: string;
  @Fuzz.prop("integer") age: number;
  @Fuzz.prop("integer") code: number;
  
  @Fuzz.method
  public regular_instance_simple (
    @Fuzz.arg("integer") age: number
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
  public regular_instance_regular (
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
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

  @Fuzz.method
  public async regular_instance_IAsync(
    @Fuzz.arg("string") name: string,
    @Fuzz.arg("integer") age: number,
    @Fuzz.arg("integer") code: number
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

  // @Fuzz.method
  // public async regular_instance_async(
  //   @Fuzz.arg("string") name: string,
  //   @Fuzz.arg("integer") age: number,
  //   @Fuzz.arg("integer") code: number
  // ): Promise<boolean> {
  //   const flatPromise = new FlatPromise();

  //   setTimeout(() => {
  //     if (this.code == CODE_7) {
  //       if (this.name == 'Bob') {
  //         flatPromise.resolve(false);
  //       }
  //     } else if (this.code == CODE_10) {
  //       if (this.age == AGE_22 && this.name == 'Alice') {
  //         flatPromise.resolve(false);
  //       }
  //     }
  //     flatPromise.resolve(true);
  //   }, 1);
  
  //   return await flatPromise.promise;
  // }
}