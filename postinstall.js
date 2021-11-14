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
}
Main();
