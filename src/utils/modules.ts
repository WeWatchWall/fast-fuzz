import { GeneratorType } from "../generators/GeneratorType";
import { IGenerator } from "../generators/IGenerator";
import { MethodArg } from "./decorators";

export class ModuleMethod {
  name: string;
  className?: string;
  namespaces: string[];
  // Doesn't need to waste memory when it's externally managed.
  // Usually throws property not in use for the class.
  // file: string;
  isAbstract: boolean;
  isAsync: boolean;
  isStatic: boolean;
  args: string[];
  literals: string[];

  IArgs: [string, string];

  test: TestMethod;

  constructor(init: Partial<ModuleMethod>) {
    Object.assign(this, init);
  }
}

export class TestMethod {
  args: MethodArg[];
  isStart: boolean;

  generators: IGenerator[];
  typeGenerators: GeneratorType[];

  // Storage for the method run args.
  callArgs?: any[];
  // Storage for the method run arg types.
  callArgsTypes?: {
    index: number,
    dimension: number,
    types: ModuleType[]
  }[];
  // Storage for the constructed instance.
  instance?: any;
  // Storage for the instance type.
  instanceType?: ModuleType;
}

export class ModuleType {
  name: string;
  namespaces: string[];
  file: string;
  kind: 'interface' | 'class' | 'enum';
  isAbstract?: boolean;
  inherits: [string, string][];

  extends?: ModuleType[];

  constructor(init: ModuleType) {
    Object.assign(this, init);
  }
}