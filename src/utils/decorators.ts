import { GeneratorFactory } from "../generators/GeneratorFactory";
import { GeneratorFalsy } from "../generators/GeneratorFalsy";
import { IGenerator } from "../generators/IGenerator";
import { Globals } from "./globals";
import { ModuleMethod, ModuleType, TestMethod } from "./modules";

export type BuiltIn = 'boolean' | 'integer' | 'float' | 'date' | 'string';

export class MethodArg {
  index: number;
  type: BuiltIn | string;
  dimension: number;
  isSkip: boolean;
  min?: number;
  max?: number;
}

export class Decorators {
  private static fileName?: string;
  private static className?: string;
  private static methodName?: string;
  private static lastIndex?: number;
  private static args: (MethodArg)[] = [];

  static addArgument (
    target: any,
    key: string | symbol,
    arg: MethodArg
  ): void {
    if (!Decorators.checkMethod(5, target, key, arg.index)) {
      Decorators.resetMethod();
    }

    if (Decorators.args.length === 0) {
      Decorators.fileName = Decorators.getFileName(4);
      Decorators.className = Decorators.getMethodName(target);
      Decorators.methodName = new String(key).toString();
      Decorators.lastIndex = arg.index;
    }

    Decorators.args.push(arg);
  }

  static addMethod(
    target: any,
    key: string | symbol,
    file: string,
    method: ModuleMethod
  ): TestMethod {
    // Check it's the same method with a dummy arg.
    if (!Decorators.checkMethod(8, target, key, -1)) {
      Decorators.resetMethod();
    }

    const result: TestMethod = {
      args: this.args,
      isStart: false,
      generators: Decorators.addMethodArgs(
        this.args,
        file,
        method
      )
    };
    method.test = result;

    Decorators.resetMethod();
    return result;
  }

  static addMethodArgs(args: MethodArg[], file: string, method: ModuleMethod): IGenerator[] {
    const result: IGenerator[] = [];

    // Initialize the generators.
    args.forEach((arg: MethodArg) => {
      if (arg.isSkip) {
        result.push(new GeneratorFalsy(0, arg.index));
        return;
      }

      let isBuiltIn = false;
      switch (arg.type) {
        case 'boolean':
        case 'integer':
        case 'float':
        case 'date':
        case 'string':
          isBuiltIn = true;
          break;
        default:
          break;
      }

      let type: ModuleType;
      if (!isBuiltIn) {
        type = Globals.codeUtil.types[file]
          .find((localType: ModuleType) => localType.name === arg.type);

        // Get the type from the central repo if it's not local.
        // Don't create a generator if it's not found.
        if (type === undefined) {
          type = Globals.codeUtil.findType(arg.type, method.IArgs, file);
        }
        if (type === undefined) {
          console.warn(
            `
              Missing type on decorated method:
              File name: ${file},
              Class name: ${method.className},
              Method name: ${method.name},
              Argument: ${JSON.stringify(arg)}
            `
          );

          return;
        }
      }

      if (isBuiltIn) {
        result.push(GeneratorFactory.init(
          <BuiltIn>arg.type,
          arg.dimension,
          method.literals,
          arg.index,
          arg.min,
          arg.max
        ));
      } else {
        result.push(GeneratorFactory.initType(
          type,
          arg.dimension,
          arg.index
        ));
      }
    });

    return result;
  }
  
  static skipMethod(
    target: any,
    key: string | symbol
  ): void {
    Decorators.resetMethod();

    // Populate the method details.
    const newFileName: string = Decorators.getFileName(7);
    const newClassName: string = Decorators.getMethodName(target);
    const newMethodName: string = new String(key).toString();

    // Find and populate the central method repo.
    const index: number = Globals
      .codeUtil
      .methods[newFileName]
      .findIndex((method: ModuleMethod) => 
        method.name === newMethodName &&
        method.className === newClassName
      );

    Globals
      .codeUtil
      .methods[newFileName]
      .splice(index, 1);
  }

  static getPropType(typeName: string): ModuleType {
    const fileName: string = Decorators.getFileName(7);
    let type: ModuleType;

    type = Globals.codeUtil.types[fileName]
      .find((localType: ModuleType) => localType.name === typeName);

    // Get the type from the central repo if it's not local.
    // Don't create a generator if it's not found.
    if (type === undefined) {
      type = Globals.codeUtil.findType(typeName, Globals.codeUtil.interfaces[fileName], fileName);
    }

    return type;
  }

  static getFileName (index: number): string {
    const stackLines = ((new Error()).stack).split('\n');
    let file = stackLines[index];
    file = file.replace(new RegExp('^[\\s]*at '), '');
    const fileBrackets = file.match(new RegExp('\\(\\S*\\)'));
    if (fileBrackets?.length > 0) {
      file = fileBrackets[0].substring(1, fileBrackets[0].length - 1);
    }
    file = file.replace(new RegExp(':[0-9]*:[0-9]*$'), '');
    return file;
  }

  static getMethodName(target: any): string {
    if (target.constructor.name === 'Function') {
      return target.name;
    }

    return target.constructor.name;
  }

  private static checkMethod(
    stackIndex: number,
    target: any,
    key: string | symbol,
    index: number
  ): boolean {
    const newFileName: string = Decorators.getFileName(stackIndex);
    const newClassName: string = Decorators.getMethodName(target);
    const newMethodName: string = new String(key).toString();

    // console.log(`
    //   fileName: ${newFileName},
    //   className: ${newClassName},
    //   methodName: ${newMethodName},
    //   arg: ${JSON.stringify(arg)}
    // `);

    if (
      Decorators.args.length > 0 &&
      !(
        newFileName === Decorators.fileName &&
        newClassName === Decorators.className &&
        newMethodName === Decorators.methodName &&
        (Decorators.lastIndex > index)
      )
    ) {
      console.warn(
        `
          Missing method decorator:
          File name: ${Decorators.fileName},
          Class name: ${Decorators.className},
          Method name: ${Decorators.methodName},
          Arguments: ${JSON.stringify(Decorators.args)}
        `
      );
      return false;
    }

    return true;
  }

  private static resetMethod () {
    Decorators.fileName = undefined;
    Decorators.className = undefined;
    Decorators.methodName = undefined;
    Decorators.lastIndex = undefined;
    Decorators.args = [];
  }

}