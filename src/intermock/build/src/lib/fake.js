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
const faker_1 = tslib_1.__importDefault(require("faker"));
const fixed_data_1 = require("./fixed-data");
/**
 * Wrapper for Faker, or any mocking framework
 */
function fake(mockType, isFixedMode = false) {
    if (isFixedMode) {
        return fixed_data_1.fixedData[mockType];
    }
    return faker_1.default.fake(`{{${mockType}}}`);
}
exports.fake = fake;
//# sourceMappingURL=fake.js.map