/**
 * Intermock general options
 */
export interface Options {
    files?: Array<[string, string]>;
    language?: SupportedLanguage;
    interfaces?: string[];
    isFixedMode?: boolean;
    output?: OutputType;
    isOptionalAlwaysEnabled?: boolean;
    count?: number;
}
declare type SupportedLanguage = 'typescript';
export declare type OutputType = 'object' | 'json' | 'string';
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
export declare function mock(options: Options): string | Record<string | number, any>;
export {};
