import 'reflect-metadata';
import { CodeUtils } from './utils/codeUtils';





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

  const codeUtil = new CodeUtils();
  await codeUtil.init(process.argv[2], process.argv[3]);
  await codeUtil.load();
  debugger;
  
}
Main();

