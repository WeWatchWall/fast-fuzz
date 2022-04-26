import path from 'path';

import { readFile } from 'fs/promises';

import glob from 'glob';
import FlatPromise from 'flat-promise';

import { tplant } from 'tplant';

import { ModuleMethod } from './moduleMethod';
import { ComponentKind } from 'tplant/dist/Models/ComponentKind';

export class CodeUtils {
  private arg: {tsFiles: string, jsFiles: string};
  private tsFiles: string[];
  private iFiles: string[];
  private jsFiles: string[];
  private typeDefs: any;
  
  methods: { [key: string]: ModuleMethod[] };
  
  interfaces: {[key: string]: [string, string]};
  modules: {[key: string]: any};

  /**
   * Inits code utils with the files and type tree specified.
   * @param tsFiles Glob pattern for the TS files -- i.e.: /src.
   * @param jsFiles Glob pattern for the JS files -- i.e.: /dist.
   */
  async init(tsFiles: string, jsFiles: string) {
    this.arg = {
      tsFiles: path.resolve(tsFiles),
      jsFiles: path.resolve(jsFiles)
    };
    this.tsFiles = await CodeUtils.getFiles(tsFiles, false);
    this.iFiles = await CodeUtils.getFiles(jsFiles, false);
    this.jsFiles = await CodeUtils.getFiles(jsFiles, true);

    this.typeDefs = tplant.generateDocumentation(this.tsFiles);

    this.methods = {};    
    this.typeDefs.forEach((tsFile: any) => {
      // Check the JS file exists and skip the type if it doesn't.
      const jsFile = path.relative(this.arg.tsFiles, tsFile.name).replace('.ts', '.js');
      const jsFileMatch = this.jsFiles.find((jsFilePath: string) => jsFilePath.endsWith(jsFile));
      if (jsFileMatch === undefined) { return; }

      // Initialize the methods for the file.
      this.methods[jsFileMatch] = [];

      tsFile.parts.forEach((filePart: any) => {
        if (
          filePart.componentKind === ComponentKind.NAMESPACE ||
          filePart.componentKind === ComponentKind.CLASS ||
          filePart.componentKind === ComponentKind.METHOD
        ) {
          CodeUtils.getMethods(filePart, this.methods[jsFileMatch], []);
        }
      });
    });
    
    this.interfaces = {};
    this.modules = {};

    // TODO: Check for duplicate types.
  }

  /**
   * Loads the heavy code utils -- i.e.: interface files and imports.
   */
  async load() {
    // Load the interfaces into memory from typings files. Skip undefined JS files.
    for (const iFile of this.iFiles) {
      const jsFile = path.relative(this.arg.jsFiles, iFile).replace('.d.ts', '.js');
      const jsFileMatch = this.jsFiles.find((jsFilePath: string) => jsFilePath.endsWith(jsFile));
      if (jsFileMatch === undefined) { continue; }
      this.interfaces[jsFileMatch] = await CodeUtils.getInterfaceFile(iFile);
    }
  
    // Load the argument interfaces into memory by method.
    for (const jsFile in this.interfaces) {
      const [, iString]: [string, string] = this.interfaces[jsFile];
      const methods: ModuleMethod[] = this.methods[jsFile];

      await CodeUtils.getMethodArguments(iString, methods);
    }

    // Load the modules into memory by file. Skip undefined JS files.
    for (const jsFile of this.jsFiles) {
      const tsFile = path.relative(this.arg.jsFiles, jsFile).replace('.js', '.ts');
      if (this.tsFiles.find((tsFilePath: string) => tsFilePath.endsWith(tsFile)) === undefined) { continue; }
      this.modules[jsFile] = await import(jsFile);
    }
  }

  /**
   * Gets the absolute file names from the specfiied patterns.
   * @param filesArgument The file glob pattern.
   * @param isJs Whether to extract TS or JS files.
   * @returns  The file paths.
   */
  private static async getFiles(filesArgument: string, isJs: boolean): Promise<string[]> {
    const flatPromise = new FlatPromise();

    glob(<string>`${filesArgument}/**/*.${isJs ? 'js' : 'ts'}`, {}, (err: Error | null, matches: string[]): void => {
      if (err !== null) {
        flatPromise.reject(err);
        return;
      }
  
      const absolutePaths = matches.map((match: string) => path.resolve(match));
      flatPromise.resolve(absolutePaths);
    });
  
    return flatPromise.promise;
  }

  /**
   * Gets methods from the type analyzer.
   * @param filePart The type node.
   * @param methodsOut The methods array reference.
   * @param namespaces The current namespaces.
   * @param [className] The method's class name.
   * @returns  The array of ModuleMethods in the methodsOut parameter.
   */
  private static getMethods(filePart: any, methodsOut: ModuleMethod[], namespaces: string[], className?: string): void {
    switch (filePart.componentKind) {
      case ComponentKind.NAMESPACE:
        // Handle nested namespaces with recursion.
        filePart.parts.forEach((fileSubPart: any) => {
          CodeUtils.getMethods(fileSubPart, methodsOut, namespaces.concat([filePart.name]));
        });
        break;
      case ComponentKind.CLASS:
        // Loop over the constructor and class methods and invoke recursively.
        filePart.constructorMethods.forEach((fileSubPart: any) => {
          CodeUtils.getMethods(fileSubPart, methodsOut, namespaces, filePart.name);
        });
        filePart.members.forEach((fileSubPart: any) => {
          CodeUtils.getMethods(fileSubPart, methodsOut, namespaces, filePart.name);
        });
        break;
      case ComponentKind.METHOD:
        // Sanity check for public non-abstract methods.
        if (
          filePart.modifier !== 'public' ||
          filePart.isAbstract
        ) {
          return;
        }

        // Construct and output the method object.
        const method = new ModuleMethod({
          name: filePart.name,
          className,
          namespaces,
          isStatic: filePart.isStatic,
          isAsync: filePart.isAsync,
          // TODO: filter out functions?
          args: filePart.parameters.map((arg: any) => arg.name)
        });
        methodsOut.push(method);
        break;
      default:
        break;
    }
  }

  /**
   * Gets interface file string from raw .d.ts file.
   * @param iFile The .d.ts file.
   * @returns The interface file string.
   */
  private static async getInterfaceFile(iFile: string): Promise<[string, string]> {
    let code: string = await readFile(iFile, 'utf8');

    code = code.replace(new RegExp(' abstract ', 'gm'), ' ');
    code = code.replace(new RegExp(' implements ', 'gm'), ' extends ');
    code = code.replace(new RegExp(' class ', 'gm'), ' interface ');

    code = CodeUtils.getEnumStatements(code);
    return [iFile, code];
  }

  /**
   * Converts enum statements from .d.ts typings file into interfaces.
   * @param code 
   * @returns Code with interface statements for enum. 
   */
  static getEnumStatements(code: string): string {
    const allEnumsPattern = new RegExp('enum [\\s\\S]*?\\}', 'gm');
    const firstEnumPattern = new RegExp('enum [\\s\\S]*?\\}', 'm');
    const enumValuePattern = new RegExp('\\{[\\s\\S]*\\}', 'gm'); 

    let result = code;
    code.match(allEnumsPattern)?.forEach((enumStatement: string) => {
      const enumNamePattern = new RegExp('enum (.*?) ', 'gm'); 
      const name = enumNamePattern.exec(enumStatement)[1];

      const objectCode: string = enumStatement.replace(new RegExp('=', 'gm'), ':');
      // TODO: remove eval soon.
      const valueObject: any = eval(`(${ objectCode.match(enumValuePattern)[0] })`);

      let valueDefinition: string;
      for (const key in valueObject) {
        if (valueDefinition === undefined) {
          valueDefinition = `${JSON.stringify(valueObject[key])}`;
          continue;
        }

        valueDefinition += ` | ${JSON.stringify(valueObject[key])}`;
      }

      const enumDefinition = `interface ${name} { ${name}: ${valueDefinition} }`;
      result = result.replace(firstEnumPattern, enumDefinition);
    });

    return result;
  }

  /**
   * Gets the interfaces for the method arguments.
   * @param iString 
   * @param methods 
   */
  private static async getMethodArguments(iString: string, methods?: ModuleMethod[]) {
    let currentIndex = 0;
    methods?.forEach((method: ModuleMethod) => {
      // Adjust the name for the constructor.
      let methodName = method.name;
      if (methodName === '__constructor') {
        methodName = 'constructor';
      }

      // Get the method signature.
      currentIndex = iString.indexOf(methodName, currentIndex);
      const endSignatureIndex = iString.indexOf(';', currentIndex);
      const methodSignature = iString.substring(currentIndex, endSignatureIndex);
      currentIndex = endSignatureIndex;

      // Get the method parameters.
      const startArgsIndex = methodSignature.indexOf('(');
      const endArgsIndex = methodSignature.lastIndexOf(')');
      let argsSignature = methodSignature.substring(startArgsIndex, endArgsIndex).slice(1);

      // TODO: filter out functions?
      // Replace commas with semicolons.
      method.args.forEach((arg: string) => {
        argsSignature = argsSignature.replace(new RegExp(`\\,[\\s]*${arg}`, 'm'), `; ${arg}`);
      });

      method.IArgs = `declare interface IFuzzArgs { ${argsSignature} }`;
    });
  }
}