 /* eslint-disable */
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
 * 
 * CHANGES: Added ability to generate multiple instances of the same
 * interface at a time via the ```count``` argument.
 */
const typescript_1 = tslib_1.__importDefault(require("typescript"));
const constants_1 = require("../../lib/constants");
const default_type_to_mock_1 = require("../../lib/default-type-to-mock");
const fake_1 = require("../../lib/fake");
const random_range_1 = require("../../lib/random-range");
const smart_props_1 = require("../../lib/smart-props");
const stringify_1 = require("../../lib/stringify");
/**
 * Generate fake data using faker for primitive types: string|number|boolean.
 *
 * @param property Output property to write to
 * @param syntaxType Type of primitive, such as boolean|number|string
 * @param options Intermock options object
 * @param mockType Optional specification of what Faker type to use
 */
function generatePrimitive(property, syntaxType, options, mockType) {
    const smartMockType = smart_props_1.smartProps[property];
    const isFixedMode = options.isFixedMode ? options.isFixedMode : false;
    if (mockType) {
        return fake_1.fake(mockType, options.isFixedMode);
    }
    else if (smartMockType) {
        return fake_1.fake(smartMockType, options.isFixedMode);
    }
    else {
        if (!default_type_to_mock_1.defaultTypeToMock[syntaxType]) {
            throw Error(`Unsupported Primitive type ${syntaxType}`);
        }
        return default_type_to_mock_1.defaultTypeToMock[syntaxType](isFixedMode);
    }
}
/**
 * Determines if a property marked as optional will have fake data generated
 * for it. Invokes this using Math.random.
 *
 * @param questionToken
 * @param options Intermock general options object
 */
function isQuestionToken(questionToken, isUnionWithNull, options) {
    if (questionToken || isUnionWithNull) {
        if (options.isFixedMode && !options.isOptionalAlwaysEnabled) {
            return true;
        }
        else if (Math.random() < .5 && !options.isOptionalAlwaysEnabled) {
            return true;
        }
    }
    return false;
}
function getLiteralTypeValue(node) {
    const { literal } = node;
    // Boolean Literal
    if (literal.kind === typescript_1.default.SyntaxKind.TrueKeyword) {
        return true;
    }
    else if (literal.kind === typescript_1.default.SyntaxKind.FalseKeyword) {
        return false;
        // String Literal
    }
    else if (literal.kind === typescript_1.default.SyntaxKind.StringLiteral) {
        return literal.text ? literal.text : '';
        // Numeric Literal
    }
    else {
        // The text IS a string, but the output value has to be a numeric value
        return Number(literal.text);
    }
}
/**
 * Process an untyped interface property, defaults to generating a primitive.
 *
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param kind TS data type of property type
 * @param mockType Specification of what Faker type to use
 * @param options Intermock general options object
 */
function processGenericPropertyType(node, output, property, kind, mockType, options) {
    if (node && node.type && typescript_1.default.isLiteralTypeNode(node.type)) {
        output[property] = getLiteralTypeValue(node.type);
        return;
    }
    const mock = generatePrimitive(property, kind, options, mockType);
    output[property] = mock;
}
/**
 * Generate a function for a call signature of a property of an interface.
 * Uses the `new Function` constructor and stringifies any internal function
 * declarations/calls or returned complex types.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function processFunctionPropertyType(node, output, property, sourceFile, options, types) {
    // TODO process args from parameters of function
    const args = '';
    let body = '';
    const funcNode = (typescript_1.default.isTypeNode(node) ? node : node.type);
    const returnType = funcNode.type;
    switch (returnType.kind) {
        case typescript_1.default.SyntaxKind.TypeReference:
            const tempBody = {};
            processPropertyTypeReference(node, tempBody, 'body', returnType.typeName.text, returnType.kind, sourceFile, options, types);
            body = `return ${stringify_1.stringify(tempBody['body'])}`;
            break;
        default:
            body = `return ${JSON.stringify(generatePrimitive('', returnType.kind, options))}`;
            break;
    }
    const func = new Function(args, body);
    output[property] = func;
}
function processIndexedAccessPropertyType(node, output, property, options, types) {
    let kind;
    const objectType = node.objectType.typeName
        .escapedText;
    const indexType = node.indexType.literal
        .text;
    const members = types[objectType].node.type
        .members;
    if (members) {
        const match = members.find((member) => member.name.escapedText === indexType);
        if (match) {
            const matchType = match.type;
            if (matchType) {
                kind = matchType.kind;
            }
        }
    }
    const isPrimitiveType = kind === typescript_1.default.SyntaxKind.StringKeyword ||
        kind === typescript_1.default.SyntaxKind.NumberKeyword ||
        kind === typescript_1.default.SyntaxKind.BooleanKeyword;
    if (isPrimitiveType && kind) {
        output[property] = generatePrimitive(indexType, kind, options);
    }
    else {
        // TODO
    }
}
/**
 * Process an individual interface property.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param typeName Type name of property
 * @param kind TS data type of property type
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function processPropertyTypeReference(node, output, property, typeName, kind, sourceFile, options, types) {
    let normalizedTypeName;
    let isArray = false;
    if (typeName.startsWith('Array<') || typeName.startsWith('IterableArray<')) {
        normalizedTypeName =
            typeName.replace(/(Array|IterableArray)\</, '').replace('>', '');
        isArray = true;
    }
    else {
        normalizedTypeName = typeName;
    }
    const typeReference = node.type;
    if (!isArray && typeReference && typeReference.typeArguments &&
        typeReference.typeArguments.length) {
        console.log('generic');
        // Process Generic
        normalizedTypeName =
            typeReference.typeName
                .escapedText;
    }
    // TODO: Handle other generics
    if (normalizedTypeName !== typeName && isArray) {
        processArrayPropertyType(node, output, property, normalizedTypeName, kind, sourceFile, options, types);
        return;
    }
    if (!types[normalizedTypeName]) {
        throw new Error(`Type '${normalizedTypeName}' is not specified in the provided files but is required for property: '${property}'. Please include it.`);
    }
    switch (types[normalizedTypeName].kind) {
        case typescript_1.default.SyntaxKind.EnumDeclaration:
            setEnum(sourceFile, output, types, normalizedTypeName, property);
            break;
        default:
            const record = types[normalizedTypeName];
            if (record.kind !== record.aliasedTo) {
                const alias = record.aliasedTo;
                const isPrimitiveType = alias === typescript_1.default.SyntaxKind.StringKeyword ||
                    alias === typescript_1.default.SyntaxKind.NumberKeyword ||
                    alias === typescript_1.default.SyntaxKind.BooleanKeyword;
                if (isPrimitiveType) {
                    output[property] = generatePrimitive(property, alias, options, '');
                }
                else if (alias === typescript_1.default.SyntaxKind.UnionType) {
                    let parameters = [];
                    if (record && record.node) {
                        const typeParameters = record.node.typeParameters;
                        if (typeParameters) {
                            parameters = typeParameters.map((value) => value.name.escapedText);
                        }
                        const updatedArr = record.node.type
                            .types.map(t => {
                            const parameterIndex = t.typeName ?
                                parameters.indexOf(t.typeName
                                    .escapedText) :
                                -1;
                            if (parameterIndex > -1) {
                                const propertyType = node.type;
                                if (propertyType && propertyType.typeArguments) {
                                    return propertyType.typeArguments[parameterIndex];
                                }
                            }
                            return t;
                        });
                        record.node.type
                            .types = updatedArr;
                        processUnionPropertyType(record.node, output, property, typeName, record.kind, sourceFile, options, types);
                    }
                }
                else if (alias === typescript_1.default.SyntaxKind.TypeLiteral) {
                    output[property] = {};
                    processFile(sourceFile, output[property], options, types, typeName);
                }
                else {
                    // TODO
                }
            }
            else {
                output[property] = {};
                processFile(sourceFile, output[property], options, types, typeName);
                break;
            }
    }
}
/**
 * Process JSDocs to determine if a different Faker type should be used to
 * mock the data of the interface.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param jsDocs JSDocs to process
 * @param options Intermock general options object
 */
function processJsDocs(node, output, property, jsDocs, options) {
    // TODO handle case where we get multiple mock JSDocs or a JSDoc like
    // mockRange for an array. In essence, we are only dealing with
    // primitives now
    // TODO Handle error case where a complex type has MockDocs
    const [tag] = findSupportedJSDocTags(jsDocs);
    const tagValue = extractTagValue(tag);
    switch (tag.tagName.text) {
        case 'mockType':
            const mock = generatePrimitive(property, node.kind, options, tagValue);
            output[property] = mock;
            break;
        case 'mockRange':
            // TODO
            break;
        default:
            throw new Error(`Unexpected tagName: ${tag.tagName.text}`);
    }
}
/**
 * Process an array definition.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param typeName Type name of property
 * @param kind TS data type of property type
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function processArrayPropertyType(node, output, property, typeName, kind, sourceFile, options, types) {
    typeName = typeName.replace('[', '').replace(']', '');
    output[property] = resolveArrayType(node, property, typeName, kind, sourceFile, options, types);
}
function resolveArrayType(node, property, typeName, kind, sourceFile, options, types) {
    typeName = typeName.replace('[', '').replace(']', '');
    const result = [];
    if (typescript_1.default.isTypeNode(node)) {
        kind = node.kind;
    }
    else if (node.type.elementType) {
        kind = node.type.elementType.kind;
    }
    const isPrimitiveType = kind === typescript_1.default.SyntaxKind.StringKeyword ||
        kind === typescript_1.default.SyntaxKind.BooleanKeyword ||
        kind === typescript_1.default.SyntaxKind.NumberKeyword;
    const arrayRange = options.isFixedMode ?
        constants_1.FIXED_ARRAY_COUNT :
        random_range_1.randomRange(constants_1.DEFAULT_ARRAY_RANGE[0], constants_1.DEFAULT_ARRAY_RANGE[1]);
    for (let i = 0; i < arrayRange; i++) {
        if (isPrimitiveType) {
            result.push(generatePrimitive(property, kind, options, ''));
        }
        else {
            const cache = {};
            processFile(sourceFile, cache, options, types, typeName);
            result.push(cache);
        }
    }
    return result;
}
/**
 * Process an tuple definition.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param typeName Type name of property
 * @param kind TS data type of property type
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function processTuplePropertyType(node, output, property, sourceFile, options, types) {
    output[property] =
        resolveTuplePropertyType(node, property, sourceFile, options, types);
}
function resolveTuplePropertyType(node, property, sourceFile, options, types) {
    const result = [];
    const { elementTypes } = node;
    for (let i = 0; i < elementTypes.length; i++) {
        const typeNode = elementTypes[i];
        switch (typeNode.kind) {
            case typescript_1.default.SyntaxKind.RestType:
                const node = typeNode.type;
                result.push(...resolveArrayType(node.elementType, property, node.getText(), node.elementType.kind, sourceFile, options, types));
                break;
            case typescript_1.default.SyntaxKind.NumberKeyword:
            case typescript_1.default.SyntaxKind.StringKeyword:
            case typescript_1.default.SyntaxKind.BooleanKeyword:
                result.push(generatePrimitive(property, typeNode.kind, options, ''));
                break;
            case typescript_1.default.SyntaxKind.LiteralType:
                result.push(getLiteralTypeValue(typeNode));
                break;
            case typescript_1.default.SyntaxKind.TupleType:
                result.push(resolveTuplePropertyType(typeNode, property, sourceFile, options, types));
                break;
            default:
                const data = {};
                processFile(sourceFile, data, options, types, typeNode.typeName
                    .text);
                result.push(data);
                break;
        }
    }
    return result;
}
/**
 * Process a union property.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param property Output property to write to
 * @param typeName Type name of property
 * @param kind TS data type of property type
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function processUnionPropertyType(node, output, property, typeName, kind, sourceFile, options, types) {
    const unionNodes = node && node.type ?
        node.type.types :
        [];
    const supportedType = unionNodes.find(type => default_type_to_mock_1.supportedPrimitiveTypes[type.kind]);
    if (supportedType) {
        output[property] =
            generatePrimitive(property, supportedType.kind, options, '');
        return;
    }
    else {
        const typeReferenceNode = unionNodes.find(node => node.kind === typescript_1.default.SyntaxKind.TypeReference);
        if (typeReferenceNode) {
            processPropertyTypeReference(typeReferenceNode, output, property, typeReferenceNode.typeName.text, typeReferenceNode.kind, sourceFile, options, types);
            return;
        }
        const arrayNode = unionNodes.find(node => node.kind === typescript_1.default.SyntaxKind.ArrayType);
        if (arrayNode) {
            processArrayPropertyType(arrayNode, output, property, `[${arrayNode.elementType.typeName
                .text}]`, arrayNode.kind, sourceFile, options, types);
            return;
        }
        const functionNode = unionNodes.find((node) => node.kind === typescript_1.default.SyntaxKind.FunctionType);
        if (functionNode) {
            processFunctionPropertyType(functionNode, output, property, sourceFile, options, types);
            return;
        }
        const indexedAccessNode = unionNodes.find((node) => node.kind === typescript_1.default.SyntaxKind.IndexedAccessType);
        if (indexedAccessNode) {
            processIndexedAccessPropertyType(indexedAccessNode, output, property, options, types);
            return;
        }
        const literalNode = unionNodes.every((node) => node.kind === typescript_1.default.SyntaxKind.LiteralType);
        if (literalNode) {
            const literalIndex = options.isFixedMode ? 0 : random_range_1.randomRange(0, unionNodes.length - 1);
            output[property] =
                getLiteralTypeValue(unionNodes[literalIndex]);
            return;
        }
        throw Error(`Unsupported Union option type ${property}: ${typeName}`);
    }
}
const SUPPORTED_JSDOC_TAGNAMES = ['mockType', 'mockRange'];
/**
 * Extract value from comment following JSDoc tag
 *
 * @param tag processed tag
 */
function extractTagValue(tag) {
    let value = tag.comment || '';
    // Unwrap from braces
    if (value[0] === '{' && value[value.length - 1] === '}') {
        value = value.slice(1, -1);
    }
    return value;
}
function isSupportedJSDocTag(tag) {
    return SUPPORTED_JSDOC_TAGNAMES
        .includes(tag.tagName.text);
}
/**
 * Find mockType and mockRange JSDoc tags in array
 *
 * @param jsDocs JSDoc comments
 */
function findSupportedJSDocTags(jsDocs) {
    const supportedJsDocTags = [];
    for (const doc of jsDocs) {
        for (const tag of (doc.tags || [])) {
            if (isSupportedJSDocTag(tag)) {
                supportedJsDocTags.push(tag);
            }
        }
    }
    return supportedJsDocTags;
}
function isAnyJsDocs(jsDocs) {
    return findSupportedJSDocTags(jsDocs).length > 0;
}
/**
 * Process each interface property.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 */
function traverseInterfaceMembers(node, output, sourceFile, options, types) {
    if (node.kind !== typescript_1.default.SyntaxKind.PropertySignature) {
        return;
    }
    const processPropertySignature = (node) => {
        let jsDocs = [];
        if (node.jsDoc) {
            jsDocs = node.jsDoc;
        }
        let isUnionWithNull = false;
        const property = node.name.getText();
        const questionToken = node.questionToken;
        const isUnion = node.type && node.type.kind === typescript_1.default.SyntaxKind.UnionType;
        if (isUnion) {
            isUnionWithNull = !!node.type
                .types.map(type => type.kind)
                .some(kind => kind === typescript_1.default.SyntaxKind.NullKeyword);
        }
        let typeName = '';
        let kind;
        if (isQuestionToken(questionToken, isUnionWithNull, options)) {
            return;
        }
        if (isAnyJsDocs(jsDocs)) {
            processJsDocs(node, output, property, jsDocs, options);
            return;
        }
        if (node.type) {
            kind = node.type.kind;
            typeName = node.type.getText();
        }
        switch (kind) {
            case typescript_1.default.SyntaxKind.TypeReference:
                processPropertyTypeReference(node, output, property, typeName, kind, sourceFile, options, types);
                break;
            case typescript_1.default.SyntaxKind.UnionType:
                processUnionPropertyType(node, output, property, typeName, kind, sourceFile, options, types);
                break;
            case typescript_1.default.SyntaxKind.TupleType:
                processTuplePropertyType(node.type, output, property, sourceFile, options, types);
                break;
            case typescript_1.default.SyntaxKind.ArrayType:
                processArrayPropertyType(node, output, property, typeName, kind, sourceFile, options, types);
                break;
            case typescript_1.default.SyntaxKind.FunctionType:
                processFunctionPropertyType(node, output, property, sourceFile, options, types);
                break;
            case typescript_1.default.SyntaxKind.IndexedAccessType:
                processIndexedAccessPropertyType(node.type, output, property, options, types);
                break;
            default:
                processGenericPropertyType(node, output, property, kind, '', options);
                break;
        }
    };
    processPropertySignature(node);
}
/**
 * Process an enum and set it.
 *
 * @param sourceFile TypeScript AST object compiled from file data
 * @param output The object outputted by Intermock after all types are mocked
 * @param typeName Type name of property
 * @param property Output property to write to
 */
function setEnum(sourceFile, output, types, typeName, property) {
    const node = types[typeName].node;
    if (!node) {
        return;
    }
    const members = node.members;
    const selectedMemberIdx = Math.floor(members.length / 2);
    const selectedMember = members[selectedMemberIdx];
    // TODO handle bitwise initializers
    if (selectedMember.initializer) {
        switch (selectedMember.initializer.kind) {
            case typescript_1.default.SyntaxKind.NumericLiteral:
                output[property] = Number(selectedMember.initializer.getText());
                break;
            case typescript_1.default.SyntaxKind.StringLiteral:
                output[property] =
                    selectedMember.initializer.getText().replace(/\'/g, '');
                break;
            default:
                break;
        }
    }
    else {
        output[property] = selectedMemberIdx;
    }
}
/**
 * Traverse each declared interface in a node.
 *
 * @param node Node being processed
 * @param output The object outputted by Intermock after all types are mocked
 * @param sourceFile TypeScript AST object compiled from file data
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 * @param propToTraverse Optional specific property to traverse through the
 *     interface
 * @param path Optional specific path to write to on the output object
 */
function traverseInterface(node, output, sourceFile, options, types, propToTraverse, path) {
    let nextIndex; 
    if (path) {
        if (!output[path]) {
          output[path] = [];
        }
        output = output[path];
        nextIndex = output.length;
        output[nextIndex] = {};
        output = output[nextIndex];
    }
    if (!propToTraverse && !path) {
        const newPath = node.name.text;
        if (!output[newPath]) {
          output[newPath] = [];
        }
        output = output[newPath];
        nextIndex = output.length;
        output[nextIndex] = {};
        output = output[nextIndex];
    }
    const heritageClauses = node.heritageClauses;
    const extensions = [];
    if (heritageClauses) {
        heritageClauses.forEach((clause) => {
            const extensionTypes = clause.types;
            extensionTypes.forEach(extensionTypeNode => {
                const extensionType = extensionTypeNode.expression.getText();
                if (!types[extensionType]) {
                    throw new Error(`Type '${extensionType}' is not specified in the provided files but is required for interface extension of: '${node
                        .name.text}'. Please include it.`);
                }
                const extensionNode = types[extensionType].node;
                let extensionOutput = {};
                traverseInterface(extensionNode, extensionOutput, sourceFile, options, types, propToTraverse, path);
                extensionOutput = extensionOutput[extensionType][0];
                extensions.push(extensionOutput);
            });
        });
        extensions.forEach(extension => {
            output = Object.assign(output, extension);
        });
    }
    // TODO get range from JSDoc
    // TODO given a range of interfaces to generate, add to array. If 1
    // then just return an object
    node.forEachChild(child => traverseInterfaceMembers(child, output, sourceFile, options, types));
}
function isSpecificInterface(name, options) {
    if (!options.interfaces) {
        return true;
    }
    if (options.interfaces.indexOf(name) === -1) {
        return false;
    }
    return true;
}
/**
 * Process an individual TS file given a TS AST object.
 *
 * @param sourceFile TypeScript AST object compiled from file data
 * @param output The object outputted by Intermock after all types are mocked
 * @param options Intermock general options object
 * @param types Top-level types of interfaces/aliases etc.
 * @param propToTraverse Optional specific property to traverse through the
 *     interface
 */
function processFile(sourceFile, output, options, types, propToTraverse) {
    const processNode = (node) => {
        switch (node.kind) {
            case typescript_1.default.SyntaxKind.InterfaceDeclaration:
                /**
                 * TODO: Handle interfaces that extend others, via checking hertiage
                 * clauses
                 */
                const p = node.name.text;
                if (!isSpecificInterface(p, options) && !propToTraverse) {
                    return;
                }
                if (propToTraverse) {
                    if (p === propToTraverse) {
                      for (let index = 0; index < options.count; index++) {
                          traverseInterface(node, output, sourceFile, options, types, propToTraverse);
                      }
                    }
                }
                else {
                  for (let index = 0; index < options.count; index++) {
                      traverseInterface(node, output, sourceFile, options, types);
                  }
                }
                break;
            case typescript_1.default.SyntaxKind.TypeAliasDeclaration:
                const type = node.type;
                const path = node.name.text;
                if (!isSpecificInterface(path, options)) {
                    return;
                }
                if (propToTraverse) {
                    if (path === propToTraverse) {
                      for (let index = 0; index < options.count; index++) {
                          traverseInterface(type, output, sourceFile, options, types, propToTraverse);
                      }
                    }
                }
                else {
                  for (let index = 0; index < options.count; index++) {
                      traverseInterface(type, output, sourceFile, options, types, undefined, path);
                  }
                }
                break;
            default:
                break;
        }
        typescript_1.default.forEachChild(node, processNode);
    };
    processNode(sourceFile);
}
/**
 * Gathers all interfaces and types references ahead of time so that when
 * interface properties reference them then we can know their type.
 *
 * @param sourceFile TypeScript AST object compiled from file data
 */
function gatherTypes(sourceFile) {
    const types = {};
    let modulePrefix = '';
    const processNode = (node) => {
        const name = node.name;
        const text = name ? name.text : '';
        // Process declared namespaces and modules
        if (node.kind === typescript_1.default.SyntaxKind.ModuleDeclaration) {
            modulePrefix = text;
            if (node.body) {
                processNode(node.body);
            }
            return;
        }
        let aliasedTo;
        if (node.type) {
            aliasedTo = node.type.kind;
        }
        else {
            aliasedTo = node.kind;
        }
        if (modulePrefix) {
            types[`${modulePrefix}.${text}`] = { kind: node.kind, aliasedTo, node };
        }
        types[text] = { kind: node.kind, aliasedTo, node };
        typescript_1.default.forEachChild(node, processNode);
    };
    processNode(sourceFile);
    return types;
}
/**
 * Fromat output based on the specified output type in the options object.
 *
 * @param output The object outputted by Intermock after all types are mocked
 * @param options Intermock general options object
 */
function formatOutput(output, options) {
    switch (options.output) {
        case 'json':
            return JSON.stringify(output);
        case 'string':
            return stringify_1.stringify(output);
        default:
            return output;
    }
}
/**
 * Intermock API.
 *
 * Given an options object, with a files array property, Intermock parses the
 * AST and generates mock objects with fake data.
 *
 * This is the only part of the API exposed to a caller (including the CLI).
 * All data is passed through the `files` property on the options object.
 *
 * @param options Intermock general options object
 */
function mock(options) {
    const output = {};
    const fileContents = options.files;
    if (!fileContents) {
        return {};
    }
    if (!options.count) {
      options.count = 1;
    }
    const types = fileContents.reduce((sum, f) => {
        const type = gatherTypes(typescript_1.default.createSourceFile(f[0], f[1], typescript_1.default.ScriptTarget.ES2015, true));
        return Object.assign(Object.assign({}, sum), type);
    }, {});
    fileContents.forEach((f) => {
        processFile(typescript_1.default.createSourceFile(f[0], f[1], typescript_1.default.ScriptTarget.ES2015, true), output, options, types);
    });
    return formatOutput(output, options);
}
exports.mock = mock;
//# sourceMappingURL=intermock.js.map