export class ModuleMethod {
  name: string;
  className?: string;
  namespaces: string[];
  isStatic: boolean;
  isAsync: boolean;

  argumentInterface: string;

  constructor(init: Partial<ModuleMethod>) {
    Object.assign(init, this);
  }
}