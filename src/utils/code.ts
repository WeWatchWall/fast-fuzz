import path from 'path';

import { readFileSync } from 'fs';
import ts from 'typescript';

import glob from 'glob';
import FlatPromise from 'flat-promise';

import { tplant } from 'tplant';

import { ModuleMethod, ModuleType } from './modules';
import { ComponentKind } from 'tplant/dist/Models/ComponentKind';

export class Code {
  private arg: { tsFiles: string, jsFiles: string };
  private tsFiles: string[];
  private iFiles: string[];
  private jsFiles: string[];
  private typeDefs: any;

  methods: { [key: string]: ModuleMethod[] };
  types: { [key: string]: ModuleType[] };

  interfaces: { [key: string]: [string, string] };
  modules: { [key: string]: any };

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
    this.tsFiles = await Code.getFiles(tsFiles, false);
    this.iFiles = await Code.getFiles(jsFiles, false);
    this.jsFiles = await Code.getFiles(jsFiles, true);

    this.typeDefs = tplant.generateDocumentation(this.tsFiles);

    /* #region  Extract the method information. */
    this.methods = {};
    this.typeDefs.forEach((tsFile: any) => {
      // Check the JS file exists and skip the type if it doesn't.
      const jsFileMatch = this.getJsFile(tsFile.name);
      if (jsFileMatch === undefined) { return; }

      // Initialize the methods for the file.
      this.methods[jsFileMatch] = [];

      // Extract the signatures.
      tsFile.parts.forEach((filePart: any) => {
        if (
          filePart.componentKind === ComponentKind.NAMESPACE ||
          filePart.componentKind === ComponentKind.CLASS ||
          filePart.componentKind === ComponentKind.METHOD
        ) {
          Code.getMethods(filePart, this.methods[jsFileMatch], []);
        }
      });

      Code.getLiterals(tsFile.name, this.methods[jsFileMatch]);
    });
    /* #endregion */

    /* #region  Extract the type inheritance. */
    this.types = {};
    this.typeDefs.forEach((tsFile: any) => {
      // Check the JS file exists and skip the type if it doesn't.
      const jsFile = path.relative(this.arg.tsFiles, tsFile.name).replace('.ts', '.js');
      const jsFileMatch = this.jsFiles.find((jsFilePath: string) => jsFilePath.endsWith(jsFile));
      if (jsFileMatch === undefined) { return; }

      // Initialize the methods for the file.
      this.types[jsFileMatch] = [];

      tsFile.parts.forEach((filePart: any) => {
        if (
          filePart.componentKind === ComponentKind.NAMESPACE ||
          filePart.componentKind === ComponentKind.INTERFACE ||
          filePart.componentKind === ComponentKind.CLASS ||
          filePart.componentKind === ComponentKind.ENUM
        ) {
          this.getTypes(jsFileMatch, filePart, this.types[jsFileMatch], []);
        }
      });
    });

    Object.values(this.types).forEach((moduleTypes: ModuleType[]) => {
      moduleTypes.forEach((moduleType: ModuleType) => {
        Code.getExtends(undefined, undefined, moduleType, this.types);
        moduleType.inherits.forEach((typeTarget: [string, string]) => {
          Code.getExtends(typeTarget[1], typeTarget[0], moduleType, this.types);
        });
      });
    });
    /* #endregion */

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
      this.interfaces[jsFileMatch] = Code.getInterfaceFile(iFile);
    }

    // Load the argument interfaces into memory by method.
    for (const jsFile in this.interfaces) {
      const [iFile, iString]: [string, string] = this.interfaces[jsFile];
      const methods: ModuleMethod[] = this.methods[jsFile];

      Code.getMethodArguments(iFile, iString, methods);
    }

    // Append the date interface.
    this.interfaces['./date.js'] = [
      './date.d.ts',
      `
        export interface Date {
          Date: number;
        }
      `
    ];

    // TODO: Execute this lazily outside of this method(Keep last in this method).
    // Load the modules into memory by file. Skip undefined JS files.
    for (const jsFile of this.jsFiles) {
      const tsFile = path.relative(this.arg.jsFiles, jsFile).replace('.js', '.ts');
      if (this.tsFiles.find((tsFilePath: string) => tsFilePath.endsWith(tsFile)) === undefined) { continue; }
      this.modules[jsFile] = await import(jsFile);
    }
  }

  /**
   * Finds type from name and interface string.
   * @param typeName Type name.
   * @param ICode Interface string.
   */
  findType(typeName: string, ICode: [string, string], file: string): ModuleType {
    // Check that the type is imported.
    const startI = ICode[1].indexOf(typeName);
    if (startI === -1) { return undefined; }
  
    // Find the end of the import and get the string.
    const endI = ICode[1].indexOf(';', startI) + 1;
    let statement = ICode[1].substring(startI, endI);

    const fromI = statement.indexOf(' from ');
    statement = statement.substring(fromI + 7, statement.length - 2);

    const fileName = path.resolve(file.replace(path.basename(file), ''), `${statement}.js`);
    const result = this.types[fileName]
      .find((type: ModuleType) => type.name === typeName);
    
    return result;
  }
  /**
   * Gets js file from the ts file path.
   * TODO: Too much like good ol' Python, fix perf...
   * @param tsFile TS file path.
   * @param tsFilePattern TS file pattern.
   * @param jsFiles Array of JS files.
   * @returns  
   */
  private getJsFile(tsFile: string): string {
    const jsFile = path.relative(this.arg.tsFiles, tsFile).replace('.ts', '.js');
    const jsFileMatch = this.jsFiles.find((jsFilePath: string) => jsFilePath.endsWith(jsFile));
    return jsFileMatch;
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

  static getLiterals(fileName: any, moduleMethods: ModuleMethod[]) {
    const file: string = readFileSync(path.resolve(fileName), 'utf8');
    let currentIndex = -1;

    function findLiterals(node: ts.Node) {
      let isNew = false;
      switch (node.kind) {
        case ts.SyntaxKind.Constructor:
          isNew = true;
          break;
        case ts.SyntaxKind.FunctionDeclaration:
          const isSkipNested =
            (currentIndex === moduleMethods.length - 1) ||
            moduleMethods[currentIndex + 1].name !== (<ts.FunctionDeclaration>node).name.escapedText;
          isNew = !isSkipNested;
          break;
        case ts.SyntaxKind.MethodDeclaration:
          // TODO: refactor with detect method type from tplant
          const isSkipModifier: ts.Modifier = node.modifiers?.find((modifier: ts.Modifier) => 
            [
              ts.SyntaxKind.AbstractKeyword,
              ts.SyntaxKind.PrivateKeyword,
              ts.SyntaxKind.ProtectedKeyword
            ].includes(modifier.kind)
          );
          isNew = isSkipModifier === undefined;
          break;
        default:
          break;
      }

      if (isNew) { currentIndex++; }
      if (currentIndex === -1) {
        ts.forEachChild(node, findLiterals);
        return;
      }

      switch (node.kind) {
        case ts.SyntaxKind.NumericLiteral:
        case ts.SyntaxKind.BigIntLiteral:
        case ts.SyntaxKind.StringLiteral:
          // Check if this literal is in a decorator.
          let isDecorator = false;
          let parentNode = node;
          while (parentNode.parent !== undefined) {
            isDecorator = isDecorator || parentNode.kind === ts.SyntaxKind.Decorator;
            parentNode = parentNode.parent;
          }

          if (!isDecorator) { moduleMethods[currentIndex].literals.push(node.getText()); }          
          break;
        default:
          break;
      }

      ts.forEachChild(node, findLiterals);
    }

    if (moduleMethods.length > 0) {
      const sourceFile = ts.createSourceFile(fileName, file, ts.ScriptTarget.ES2015, true);
      findLiterals(sourceFile);
    }
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
          Code.getMethods(fileSubPart, methodsOut, namespaces.concat([filePart.name]));
        });
        break;
      case ComponentKind.CLASS:
        // Loop over the constructor and class methods and invoke recursively.
        filePart.constructorMethods.forEach((fileSubPart: any) => {
          Code.getMethods(fileSubPart, methodsOut, namespaces, filePart.name);
        });
        filePart.members.forEach((fileSubPart: any) => {
          Code.getMethods(fileSubPart, methodsOut, namespaces, filePart.name);
        });
        break;
      case ComponentKind.METHOD:
        // Sanity check for public non-abstract methods.
        // TODO: refactor with detect function type from typescript
        if (
          filePart.modifier !== 'public' ||
          filePart.isAbstract ||
          // TODO: might need an option for module functions?
          className === undefined
        ) {
          return;
        }

        // Construct and output the method object.
        const method = new ModuleMethod({
          name: filePart.name,
          className,
          namespaces,
          isAbstract: filePart.isAbstract,
          isAsync: filePart.isAsync,
          isStatic: filePart.isStatic,
          literals: [],
          
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
   * Gets type inheritance from the type analyzer.
   * @param file The type file for later.
   * @param filePart The type node.
   * @param methodsOut The methods array reference.
   * @param namespaces The current namespaces.
   * @param [className] The method's class name.
   * @returns  The array of ModuleMethods in the methodsOut parameter.
   */
  private getTypes(file: string, filePart: any, typesOut: ModuleType[], namespaces: string[]): void {
    switch (filePart.componentKind) {
      case ComponentKind.NAMESPACE:
        // Handle nested namespaces with recursion.
        filePart.parts.forEach((fileSubPart: any) => {
          this.getTypes(file, fileSubPart, typesOut, namespaces.concat([filePart.name]));
        });
        break;
      case ComponentKind.ENUM:
        typesOut.push(new ModuleType({
          name: filePart.name,
          namespaces: namespaces,
          file: file,
          kind: 'enum',
          inherits: []
        }));
        break;
      case ComponentKind.INTERFACE:
        typesOut.push(new ModuleType({
          name: filePart.name,
          namespaces: namespaces,
          file: file,
          kind: 'interface',
          inherits: []
        }));
        break;
      case ComponentKind.CLASS:
        const result = new ModuleType({
          name: filePart.name,
          namespaces: namespaces,
          file: file,
          kind: 'class',
          isAbstract: filePart.isAbstract,
          inherits: []
        });

        if (filePart.extendsClass !== undefined) {
          result.inherits.push([
            this.getJsFile(path.resolve(filePart.extendsClassFile)),
            filePart.extendsClass
              .substring(Math.max(0, filePart.extendsClass.lastIndexOf('.')))
              .replace('.', '')
          ]);
        }

        filePart.implementsInterfaces.forEach((iName: string, index: number) => {
          result.inherits.push([
            this.getJsFile(path.resolve(filePart.implementsInterfacesFiles[index])),
            iName
              .substring(Math.max(0, iName.lastIndexOf('.')))
              .replace('.', '')
          ]);
        });

        typesOut.push(result);
        break;
      default:
        break;
    }
  }

  /**
   * Populate the extends properties for all the types.
   * @param target  The target type name.
   * @param targetFile  The target type file.
   * @param newType  The next extending type.
   * @param types All the partially-populated types by file. 
   */
  private static getExtends(target: string, targetFile: string, newType: ModuleType, types: { [key: string]: ModuleType[] }): void {
    // Update the added module's self reference.
    // Only for concrete classes and enums.
    if (
      newType.kind !== 'interface' &&
      !newType.isAbstract
    ) {
      if (newType.extends === undefined) { newType.extends = []; }

      // Add its own type as a concrete extender.
      const selfTypeExists = newType.extends.find((extendsType: ModuleType) => extendsType.name === newType.name);
      if (selfTypeExists === undefined) {
        newType.extends.push(newType);
      }
    } else {
      // Nothing more to do with abstract classes and enums.
      return;
    }

    // Allow the method to get called at least once per type.
    if (
      target === undefined ||
      targetFile === undefined
    ) {
      return;
    }

    const targetType: ModuleType = types[targetFile].find((targetType: ModuleType) => targetType.name === target);

    // Update all the inherited types with the current type.
    if (
      targetType.inherits !== undefined &&
      targetType.inherits.length > 0
    ) {
      targetType.inherits.forEach((inherit: [string, string]) => {
        Code.getExtends(inherit[1], inherit[0], newType, types);
      });
    }

    // Add the new type to the target type if necessary.
    if (targetType.extends === undefined) {
      targetType.extends = [];
    }
    const moduleTypeExists: ModuleType = targetType.extends.find((extendsType: ModuleType) => extendsType.name === newType.name);
    if (moduleTypeExists === undefined) {
      targetType.extends.push(newType);
    }
  }

  /**
   * Gets interface file string from raw .d.ts file.
   * @param iFile The .d.ts file.
   * @returns The interface file string.
   */
  private static getInterfaceFile(iFile: string): [string, string] {
    let code: string = readFileSync(iFile, 'utf8');

    code = code.replace(new RegExp(' abstract ', 'gm'), ' ');
    code = code.replace(new RegExp(' implements ', 'gm'), ' extends ');
    code = code.replace(new RegExp(' class ', 'gm'), ' interface ');

    code = Code.getEnumStatements(code);
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
      const valueObject: any = eval(`(${objectCode.match(enumValuePattern)[0]})`);

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
   * @param iFile
   * @param iString 
   * @param methods 
   */
  private static getMethodArguments(iFile: string, iString: string, methods?: ModuleMethod[]): void {
    let indexLastImport = iString.lastIndexOf('import ');
    if (indexLastImport > -1) {
      indexLastImport = iString.indexOf(';', indexLastImport) + 1;
    }

    const importSection = iString.substring(0, Math.max(0, indexLastImport));

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

      const fileName = path.basename(iFile).replace('.d.ts', '');
      method.IArgs = [
        iFile.replace(fileName, 'IFuzzArgs'),
        `${importSection} declare interface IFuzzArgs { ${argsSignature} }`
      ];
    });
  }
}