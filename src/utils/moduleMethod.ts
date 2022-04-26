export class ModuleMethod {
  name: string;
  className?: string;
  namespaces: string[];
  isStatic: boolean;
  isAsync: boolean;
  args: string[];

  IArgs: string;

  constructor(init: Partial<ModuleMethod>) {
    Object.assign(this, init);
  }
}