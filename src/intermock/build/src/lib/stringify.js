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
/**
 * Stringfy a POJO and preserve its functions.
 *
 * Courtesy of @cowboy
 * https://gist.github.com/cowboy/3749767
 * @param obj
 */
function stringify(obj) {
    const placeholder = '____PLACEHOLDER____';
    const fns = [];
    let json = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function') {
            fns.push(value);
            return placeholder;
        }
        return value;
    }, 2);
    json = json.replace(new RegExp('"' + placeholder + '"', 'g'), () => {
        const result = fns.shift();
        if (!result) {
            return '';
        }
        return result;
    });
    return json + ';';
}
exports.stringify = stringify;
//# sourceMappingURL=stringify.js.map