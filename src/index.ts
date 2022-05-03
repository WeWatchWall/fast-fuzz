import 'reflect-metadata';
import { fuzz } from './fuzz/fuzz';

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

  await fuzz();
  debugger;
}
Main();

