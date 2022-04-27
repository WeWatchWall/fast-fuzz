export class ModuleMethod {
  name: string;
  className?: string;
  namespaces: string[];
  // Doesn't need to waste memory when it's externally managed.
  // Usually throws property not in use for the class.
  // file: string;
  isStatic: boolean;
  isAsync: boolean;
  args: string[];

  IArgs: string;

  constructor(init: Partial<ModuleMethod>) {
    Object.assign(this, init);
  }
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