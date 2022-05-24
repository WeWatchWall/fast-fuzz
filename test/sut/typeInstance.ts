import {
  fuzzProp
} from "../../src/fast-fuzz";

export interface IInstance {
  name: string;
  age: number;
  code: number;

  getValue(): any[];
}

export class Reference_Instance implements IInstance {
  @fuzzProp("string") name: string;
  @fuzzProp("integer") age: number;
  @fuzzProp("integer") code: number;

  constructor(init: Partial<Reference_Instance>) {
    Object.assign(this, init);
  }

  getValue(): any[] {
    return [this.name, this.age, this.code, Reference_Instance.name];
  }
}