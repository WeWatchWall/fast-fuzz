"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("mocha");
const chai_1 = require("chai");
const index_1 = require("../../index");
const read_files_1 = require("../../src/lib/read-files");
const any_1 = require("./test-data/any");
const array_1 = require("./test-data/array");
const enum_1 = require("./test-data/enum");
const extension_1 = require("./test-data/extension");
const flat_1 = require("./test-data/flat");
const generic_1 = require("./test-data/generic");
const json_1 = require("./test-data/json");
const mappedTypes_1 = require("./test-data/mappedTypes");
const mockType_1 = require("./test-data/mockType");
const namespace_1 = require("./test-data/namespace");
const nestedSingle_1 = require("./test-data/nestedSingle");
const optional_1 = require("./test-data/optional");
const specificInterfaces_1 = require("./test-data/specificInterfaces");
const tuple_1 = require("./test-data/tuple");
const typeAlias_1 = require("./test-data/typeAlias");
const unions_1 = require("./test-data/unions");
function runTestCase(file, outputProp, expected, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const files = yield read_files_1.readFiles([file]);
        const imOptions = Object.assign({}, { files, isFixedMode: true }, options);
        const output = index_1.mock(imOptions);
        if (outputProp) {
            chai_1.expect(output[outputProp]).to.deep.equal(expected);
        }
        else {
            chai_1.expect(output).to.deep.equal(expected);
        }
    });
}
function getOutput(file, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const files = yield read_files_1.readFiles([file]);
        const imOptions = Object.assign({}, { files, isFixedMode: true }, options);
        return index_1.mock(imOptions);
    });
}
describe('Intermock TypeScript: Mock tests', () => {
    it('should generate mock for a flat interface, with just primitives', () => {
        return runTestCase(`${__dirname}/test-data/flat.ts`, 'FlatInterface', flat_1.expectedFlat);
    });
    it('should generate mock for a specified mock type', () => {
        return runTestCase(`${__dirname}/test-data/mockType.ts`, 'FlatPerson', mockType_1.expectedMockType);
    });
    it('should generate mock for singly nested interfaces', () => {
        return runTestCase(`${__dirname}/test-data/nestedSingle.ts`, 'Person', nestedSingle_1.expectedNested);
    });
    it('should generate mock for interfaces with optional types - optional forced as always', () => {
        return runTestCase(`${__dirname}/test-data/optional.ts`, 'User', optional_1.expectedOptional1.User);
    });
    it('should generate mock for interfaces with optional types - optional forced as never', () => {
        return runTestCase(`${__dirname}/test-data/optional.ts`, 'User', optional_1.expectedOptional2.User, { isOptionalAlwaysEnabled: true });
    });
    it('should generate mock for type aliases - as a property', () => {
        return runTestCase(`${__dirname}/test-data/typeAlias.ts`, 'Person', typeAlias_1.expectedTypeAlias.Person);
    });
    it('should generate mock for type aliases - as a definition', () => {
        return runTestCase(`${__dirname}/test-data/typeAlias.ts`, 'Detail', typeAlias_1.expectedTypeAlias.Detail);
    });
    it('should generate mock for enums', () => {
        return runTestCase(`${__dirname}/test-data/enum.ts`, 'Person', enum_1.expectedEnum.Person);
    });
    it('should generate mock for unions - with generic types', () => {
        return runTestCase(`${__dirname}/test-data/unions.ts`, 'Account', unions_1.expectedUnion.Account);
    });
    it('should generate mock for unions - with type references', () => {
        return runTestCase(`${__dirname}/test-data/unions.ts`, 'Person', unions_1.expectedUnion.Person);
    });
    it('should generate mock for unions - with arrays', () => {
        return runTestCase(`${__dirname}/test-data/unions.ts`, 'Pack', unions_1.expectedUnion.Pack);
    });
    it('should generate mock for unions - with literals', () => {
        return runTestCase(`${__dirname}/test-data/unions.ts`, 'Book', unions_1.expectedUnion.Book);
    });
    it('should generate mock for unions - for null option to work like question mark', () => {
        return runTestCase(`${__dirname}/test-data/unions.ts`, 'LonelyHuman', unions_1.expectedUnion.LonelyHuman);
    });
    it('should generate mock for basic arrays', () => {
        return runTestCase(`${__dirname}/test-data/array.ts`, 'User', array_1.expectedArray1.User);
    });
    it('should generate mock for basic tuples', () => {
        return runTestCase(`${__dirname}/test-data/tuple.ts`, 'Test', tuple_1.expectedTuple1.Test);
    });
    it('should generate mock for specific interfaces', () => {
        return runTestCase(`${__dirname}/test-data/specificInterfaces.ts`, '', specificInterfaces_1.expectedSpecificInterface, { interfaces: ['Person', 'User'] });
    });
    it('should generate mock for any types', () => {
        return runTestCase(`${__dirname}/test-data/any.ts`, 'User', any_1.expectedAny);
    });
    it('should generate mock for interfaces with functions', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const output = yield getOutput(`${__dirname}/test-data/functions.ts`);
        const basicRet = output.FunctionInterface.basicFunctionRetNum();
        const interfaceRet = output.FunctionInterface.functionRetInterface();
        chai_1.expect(basicRet).to.eql(86924);
        chai_1.expect(interfaceRet)
            .to.eql({ name: 'Natasha Jacobs', email: 'Myron_Olson39@hotmail.com' });
    }));
    it('should generate JSON', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const output = yield getOutput(`${__dirname}/test-data/json.ts`, { output: 'json' });
        chai_1.expect(JSON.parse(output)).to.deep.equal(JSON.parse(json_1.expectedJson));
    }));
    it('should generate extended interfaces', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return runTestCase(`${__dirname}/test-data/extension.ts`, 'Contractor', extension_1.expectedContractor.Contractor);
    }));
    it('should generate mock for namespaced interfaces and enums', () => {
        return runTestCase(`${__dirname}/test-data/namespace.ts`, 'Person', namespace_1.expectedNamespaced.Person);
    });
    it('should generate mock for mapped tyes', () => {
        return runTestCase(`${__dirname}/test-data/mappedTypes.ts`, 'Person', mappedTypes_1.expectedMappedTypes.Person);
    });
    it('should generate mock type references with generics', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        return runTestCase(`${__dirname}/test-data/generic.ts`, 'Person', generic_1.expectedGenerics.Person);
    }));
});
//# sourceMappingURL=mock.spec.js.map