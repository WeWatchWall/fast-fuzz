"use strict";
/**
 * Copyright 2019 Google Inc. All Rights Reserved.
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
const fs_readfile_promise_1 = tslib_1.__importDefault(require("fs-readfile-promise"));
function readFiles(files) {
    const filePromises = files.map(file => fs_readfile_promise_1.default(file));
    return new Promise((resolve) => {
        Promise.all(filePromises).then(buffers => {
            const contents = [];
            buffers.forEach((buffer, index) => contents.push([files[index], buffer.toString()]));
            resolve(contents);
        });
    });
}
exports.readFiles = readFiles;
//# sourceMappingURL=read-files.js.map