// Cleanup the error stack.
export function cleanupError(error: any) {
  const stack = error.stack.split('\n');
  
  stack.splice(-8);
  error.stack = stack.join('\n');
}

// Sets all the branch stats to 0.
export function resetCoverage (fileName: string) {
  const fileCov: any = global.__coverage__[fileName];
  fileCov.s = {};
  for (const key in fileCov.b) {
    const branchCov: any = fileCov.b[key];
    for (const index in branchCov) {
      branchCov[index] = 0;
    }
  }
  for (const key in fileCov.bT) {
    const branchCov: any = fileCov.bT[key];
    for (const index in branchCov) {
      branchCov[index] = 0;
    }
  }
  return true;
}

// Fastest known hash method for a string.
export function simpleHash (str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char: number = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
}