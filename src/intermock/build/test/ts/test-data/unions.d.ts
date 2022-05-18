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
interface Dog {
    name: string;
    owner: string;
}
export interface LonelyHuman {
    name: string;
    bestFriend: Dog | null;
}
export declare const expectedUnion: {
    Person: {
        name: string;
        age: number;
        bestFriend: {
            name: string;
            owner: string;
        };
    };
    Pack: {
        id: string;
        dogs: {
            name: string;
            owner: string;
        }[];
    };
    Account: {
        id: string;
        lastDeposit: number;
    };
    LonelyHuman: {
        name: string;
    };
    Book: {
        title: string;
        color: string;
    };
};
export {};
