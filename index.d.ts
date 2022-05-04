declare module 'fast-fuzz' {
  export function fastFuzz(
    testFunc: Function, // eslint-disable-line @typescript-eslint/ban-types
    filePath: string,
    parameterSchema?: any,
    literals?: any[],
    maxTime?: number,
    maxRuns?: number,
    reset?: boolean,
    verbose?: boolean
  ): {
    coverage: any,
    tests: any
  };

  export function fastFuzzAsync(
    testFunc: Function, // eslint-disable-line @typescript-eslint/ban-types
    filePath: string,
    parameterSchema?: any,
    literals?: any[],
    maxTime?: number,
    maxRuns?: number,
    reset?: boolean,
    verbose?: boolean
  ): Promise<{
    coverage: any,
    tests: any
  }>;
}