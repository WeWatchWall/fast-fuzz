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
var GreatMusicians;
(function (GreatMusicians) {
    GreatMusicians["mozart"] = "Mozart";
    GreatMusicians["beethoven"] = "Beethoven";
})(GreatMusicians || (GreatMusicians = {}));
var GreatNovels;
(function (GreatNovels) {
    GreatNovels[GreatNovels["MOBY_DICK"] = 0] = "MOBY_DICK";
    GreatNovels[GreatNovels["GRAPES_OF_WRATH"] = 1] = "GRAPES_OF_WRATH";
    GreatNovels[GreatNovels["SLAUGHTERHOUSE_FIVE"] = 2] = "SLAUGHTERHOUSE_FIVE";
})(GreatNovels || (GreatNovels = {}));
exports.expectedNamespaced = {
    Person: {
        name: 'Natasha Jacobs',
        status: 1,
        favoriteNumber: 3.14,
        favoriteMusicians: 'Beethoven',
        favoriteNovel: 1
    }
};
//# sourceMappingURL=namespace.js.map