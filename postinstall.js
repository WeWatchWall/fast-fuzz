#!/usr/bin/env node

async function Main() {
	/**
	 * Module dependencies.
	 */
  const fs = require( 'fs' );
  const execShellCommand = require("./execShellCommand.js");

  console.log(`1. Compiling: TypeScript.`);
  stdout = await execShellCommand('tsc');
	console.log(stdout);
  console.log(`1. Compiled: TypeScript.`);

  console.log(`2. Installing: Istanbul coverage library.`);
  // Get the files as an array
  const folderContents = await fs.promises.readdir("./istanbuljs");
  // Loop them all with the new for...of
  for (const folder of folderContents) {
    stdout = await execShellCommand(`cd ./istanbuljs/${folder} && npm i && cd ../..`);
	  console.log(stdout);
  }
  await execShellCommand(`cd ./istanbuljs/istanbul-lib-hook/node_modules/default-require-extensions && npm i && cd ../../../..`);
  console.log(`2. Installed: Istanbul coverage library.`);
}
Main();
