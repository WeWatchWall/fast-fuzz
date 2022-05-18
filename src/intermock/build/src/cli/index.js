#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const command_line_args_1 = tslib_1.__importDefault(require("command-line-args"));
const command_line_usage_1 = tslib_1.__importDefault(require("command-line-usage"));
const intermock_1 = require("../lang/ts/intermock");
const read_files_1 = require("../lib/read-files");
const optionDefinitions = [
    {
        name: 'files',
        alias: 'f',
        type: String,
        multiple: true,
        defaultOption: true
    },
    { name: 'interfaces', alias: 'i', type: String, multiple: true },
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'fixed', alias: 'x', type: Boolean },
    { name: 'outputFormat', alias: 'o', type: String },
];
const instructions = [
    {
        content: 'Intermock',
        raw: true,
    },
    {
        header: '',
        content: 'Generates fake data from TypeScript interfaces via Faker',
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'interfaces',
                typeLabel: 'example: --interfaces "Person" "User"',
                description: 'Optional list of interfaces to mock',
            },
            {
                name: 'files',
                typeLabel: 'example: web/apps/some-directory/interfaces1.ts',
                description: 'Interface files to generate fake data from',
            },
            {
                name: 'outputFormat',
                typeLabel: 'example: json',
                description: 'Format to use for output. Can be string, json or object',
            },
            {
                name: 'help',
                description: 'Print this usage guide.',
            }
        ],
    },
];
function isWelcomeMessageNeeded(options) {
    if (!options || !options.files || options.help) {
        return true;
    }
    return false;
}
function showWelcomeMessage() {
    const usage = command_line_usage_1.default(instructions);
    console.log(usage);
}
function main() {
    const options = command_line_args_1.default(optionDefinitions);
    if (isWelcomeMessageNeeded(options)) {
        showWelcomeMessage();
        return;
    }
    const isFixedMode = options.fixed;
    const interfaces = options.interfaces;
    const output = options.outputFormat;
    return read_files_1.readFiles(options.files).then((files) => {
        try {
            const result = intermock_1.mock({
                files,
                interfaces,
                isFixedMode,
                output,
            });
            console.log(result);
        }
        catch (err) {
            console.log(err.message);
        }
    });
}
main();
//# sourceMappingURL=index.js.map