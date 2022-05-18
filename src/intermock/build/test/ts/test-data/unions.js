"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: test union with
// functions: currently I don't know how to make a Union for functions (if the
// first union option is a function, then the `|` character gets applied to the
// return type)
exports.expectedUnion = {
    Person: {
        name: 'Natasha Jacobs',
        age: 86924,
        bestFriend: {
            name: 'Natasha Jacobs',
            owner: 'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
        }
    },
    Pack: {
        id: 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        dogs: [
            {
                name: 'Natasha Jacobs',
                owner: 'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
            },
            {
                name: 'Natasha Jacobs',
                owner: 'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
            },
            {
                name: 'Natasha Jacobs',
                owner: 'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.'
            }
        ]
    },
    Account: {
        id: 'bfc8cb62-c6ce-4194-a2a5-499320b837eb',
        lastDeposit: 86924,
    },
    LonelyHuman: {
        name: 'Natasha Jacobs',
    },
    Book: {
        title: 'Animi repellat eveniet eveniet dolores quo ullam rerum reiciendis ipsam. Corrupti voluptatem ipsa illum veritatis eligendi sit autem ut quia. Ea sint voluptas impedit ducimus dolores possimus.',
        color: 'red'
    }
};
//# sourceMappingURL=unions.js.map