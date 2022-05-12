import { BuiltIn } from "../utils/decorators";
import { ModuleType } from "../utils/modules";
import { GeneratorBool } from "./GeneratorBool";
import { GeneratorDate } from "./GeneratorDate";
import { GeneratorEnum } from "./GeneratorEnum";
import { GeneratorFloat } from "./GeneratorFloat";
import { GeneratorInt } from "./GeneratorInt";
import { GeneratorString } from "./GeneratorString";
import { GeneratorType } from "./GeneratorType";
import { IGenerator } from "./IGenerator";
import { Mode } from "./Mode";

export namespace GeneratorFactory {
  
  /**
   * Factory method for generators for the built-in types.
   * @param type 
   * @param [dimension] 
   * @param [literals] 
   * @param [index] 
   * @param [min] 
   * @param [max] 
   * @returns init 
   */
   export function init(
    type: BuiltIn,
    dimension = 0,
    literals: string[],
    index?: number,
    min?: number,
    max?: number
  ): IGenerator {
    switch (type) {
      case 'boolean':
        return new GeneratorBool(dimension, index);
      case 'integer':
        return new GeneratorInt(dimension, literals, min, max, index);
      case 'float':
        return new GeneratorFloat(dimension, literals, min, max, index);
      case 'date':
        return new GeneratorDate(dimension, literals, min, max, index);
      case 'string':
        return new GeneratorString(dimension, literals, min, max, index);
      default:
        break;
    }

    return null;
  }

  /**
   * Factory method for generators for custom types.
   * @param type 
   * @param [dimension]
   * @param [index] 
   */
  export function initType(
    type: ModuleType,
    dimension = 0,
    index?: number,
    mode?: Mode,
    isIgnoreFalsy = false
  ): IGenerator {
    if (type.kind === 'enum') {
      return new GeneratorEnum(type, dimension, index); 
    } else {
      return new GeneratorType(type, dimension, index, mode, isIgnoreFalsy); 
    }
  }

}