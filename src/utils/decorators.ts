import { Generator } from "../generators/Generator";
import { IGenerator } from "../generators/IGenerator";
import { Globals } from "./globals";
import { ModuleMethod, ModuleType } from "./modules";

export type BuiltIn = 'boolean' | 'integer' | 'float' | 'date' | 'string';

export class MethodArg {
  index: number;
  type: BuiltIn | string;
  dimension: number;
  min?: number;
  max?: number;
}

export class ArgsDecorator {
  private static fileName?: string;
  private static className?: string;
  private static methodName?: string;
  private static lastIndex?: number;
  private static args: MethodArg[] = [];

  static addArgument (
    target: Object,
    key: string | symbol,
    arg: MethodArg
  ): void {
    if (!ArgsDecorator.checkMethod(5, target, key, arg)) {
      ArgsDecorator.resetMethod();
    }

    if (ArgsDecorator.args.length === 0) {
      ArgsDecorator.fileName = ArgsDecorator.getFileName(4);
      ArgsDecorator.className = target.constructor.name;
      ArgsDecorator.methodName = new String(key).toString();
      ArgsDecorator.lastIndex = arg.index;
    }

    ArgsDecorator.args.push(arg);
  };

  static addMethod(
    target: Object,
    key: string | symbol
  ): {
    isStart: boolean,
    generators: IGenerator[]
  } {
    // Check it's the same method with a dummy arg.
    if (!ArgsDecorator.checkMethod(8, target, key, { index: -1, dimension: 0, type: ''})) {
      ArgsDecorator.resetMethod();
    }

    // Populate the method details.
    const newFileName: string = ArgsDecorator.getFileName(7);
    const newClassName: string = target.constructor.name;
    const newMethodName: string = new String(key).toString();

    // Find and populate the central method repo. 
    const method = Globals.codeUtil.methods[newFileName].find((method: ModuleMethod) =>
      method.name === newMethodName &&
      method.className === newClassName
    );
    const result: {
      isStart: boolean,
      generators: IGenerator[]
    } = {
      isStart: false,
      generators: []
    };
    method.test = result;

    // TODO: Initialize the generators.
    this.args.forEach((arg: MethodArg) => {
      let isBuiltIn = false;
      switch (arg.type) {
        case 'boolean':
        case 'integer':
        case 'float':
        case 'string':
          isBuiltIn = true;
          break;
        default:
          break;
      }

      let type: ModuleType;
      if (!isBuiltIn) {
        type = Globals.codeUtil.types[newFileName]
          .find((localType: ModuleType) => localType.name === arg.type);

        // Get the type from the central repo if it's not local.
        // Don't create a generator if it's not found.
        if (type === undefined) {
          type = Globals.codeUtil.findType(arg.type, method.IArgs, newFileName);
        }
        if (type === undefined) {
          console.warn(
            `
              Missing type on decorated method:
              File name: ${newFileName},
              Class name: ${newClassName},
              Method name: ${newMethodName},
              Argument: ${JSON.stringify(arg)}
            `
          );

          return;
        }
      }

      if (isBuiltIn) {
        result.generators.push(Generator.init(
          <BuiltIn>arg.type,
          arg.dimension,
          method.literals,
          arg.min,
          arg.max,
          arg.index
        ));
      } else {
        result.generators.push(Generator.initType(
          arg.index,
          arg.type,
          arg.dimension
        ));
      }
    });

    ArgsDecorator.resetMethod();
    return result;
  }

  private static getFileName (index: number): string {
    const stackLines = ((new Error()).stack).split('\n');
    let file = stackLines[index];
    file = file.replace(new RegExp('^[\\s]*at '), '');
    file = file.replace(new RegExp(':[0-9]*:[0-9]*$'), '');

    return file;
  }

  private static checkMethod(
    stackIndex: number,
    target: Object,
    key: string | symbol,
    arg: MethodArg
  ): boolean {
    const newFileName: string = ArgsDecorator.getFileName(stackIndex);
    const newClassName: string = target.constructor.name;
    const newMethodName: string = new String(key).toString();

    // console.log(`
    //   fileName: ${newFileName},
    //   className: ${newClassName},
    //   methodName: ${newMethodName},
    //   arg: ${JSON.stringify(arg)}
    // `);

    if (
      ArgsDecorator.args.length > 0 &&
      !(
        newFileName === ArgsDecorator.fileName &&
        newClassName === ArgsDecorator.className &&
        newMethodName === ArgsDecorator.methodName &&
        (ArgsDecorator.lastIndex > arg.index)
      )
    ) {
      console.warn(
        `
          Missing method decorator:
          File name: ${ArgsDecorator.fileName},
          Class name: ${ArgsDecorator.className},
          Method name: ${ArgsDecorator.methodName},
          Arguments: ${JSON.stringify(ArgsDecorator.args)}
        `
      );
      return false;
    }

    return true;
  };

  private static resetMethod () {
    ArgsDecorator.fileName = undefined;
    ArgsDecorator.className = undefined;
    ArgsDecorator.methodName = undefined;
    ArgsDecorator.lastIndex = undefined;
    ArgsDecorator.args = [];
  };

}