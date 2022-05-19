import 'reflect-metadata';
import { fastFuzz } from './fuzz/fuzz';

import { 
  arg as fuzzArg,
  argType as fuzzArgType,
  method as fuzzMethod,
  prop as fuzzProp,
  propType as fuzzPropType,
  skipArg as fuzzSkipArg,
  skipMethod as fuzzSkipMethod,
  skipProp as fuzzSkipProp
} from './decorators';

export { 
  fastFuzz,
  fuzzArg,
  fuzzArgType,
  fuzzMethod,
  fuzzProp,
  fuzzPropType,
  fuzzSkipArg,
  fuzzSkipMethod,
  fuzzSkipProp
}
