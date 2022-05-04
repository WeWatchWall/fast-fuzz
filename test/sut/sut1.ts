// @ts-nocheck
import { Fuzz } from '../../src/';

export class SUT_1 {
  
  @Fuzz.method
  public static sut(
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
}