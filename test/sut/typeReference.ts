import {
  fuzzProp
} from "../../src/fast-fuzz";

export interface IReference {
  name: string;
  age: number;
  code: number;

  getValue(): any[];
}

export abstract class Reference_Abstract implements IReference {
  @fuzzProp("string") name: string;
  @fuzzProp("integer") age: number;
  @fuzzProp("integer") code: number;

  constructor(init: Partial<Reference_Base>) {
    Object.assign(this, init);
  }

  abstract getValue(): any[];
}

export class Reference_Base extends Reference_Abstract {
  getValue(): any[] {
    return [this.name, this.age, this.code, Reference_Base.name];
  }
}

export class Reference_Derived extends Reference_Base {
  getValue(): any[] {
    return [this.name, this.age, this.code, Reference_Derived.name];
  }
}