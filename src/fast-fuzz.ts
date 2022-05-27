import 'reflect-metadata';
import { fuzz } from './fuzz/fuzzCaller';

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
  fuzz,
  fuzzArg,
  fuzzArgType,
  fuzzMethod,
  fuzzProp,
  fuzzPropType,
  fuzzSkipArg,
  fuzzSkipMethod,
  fuzzSkipProp
}
