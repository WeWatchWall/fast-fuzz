import 'reflect-metadata';
import { Code } from './utils/code';
import { Globals } from './utils/globals';

// import { mock } from 'intermock/build/src/lang/ts/intermock';
// import { plainToInstance } from 'class-transformer';

async function Main() {

  // let fooI = plainToInstance(foo['Foo'],
  //   {
  //     name: 'test'
  //   },
  //   {
  //   enableImplicitConversion: true
  // });

  // const interfaces = Object.values(codeUtil.interfaces);
  // interfaces.push(codeUtil.methods["path"][2].IArgs);
  // let result = mock({
  //   files: interfaces,
  //   isOptionalAlwaysEnabled: true,
  //   output: 'object'
  // });
  // console.log(result);

  // Globals.codeUtil.methods["path"][1].test.isStart = true;
  // let foo = new Globals.codeUtil.modules["path"]["Bar"]["Foo"](12, true, 'UP', 1);
  // foo['isSame'](13, false, 1, 'UP');
  // foo['isSame'](13, false, 1, 'UP');

  Globals.isTest = true;

  Globals.codeUtil = new Code();
  await Globals.codeUtil.init(process.argv[2], process.argv[3]);
  await Globals.codeUtil.load();
  debugger;
}
Main();

