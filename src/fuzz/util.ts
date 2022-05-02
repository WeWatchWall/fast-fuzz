// Checks if the all the known branches are covered.
export function isCovered (fileName) {
  const fileCov = global.__coverage__[fileName];
  for (const key in fileCov.b) {
    const branchCov = fileCov.b[key];
    for (const entry of branchCov) {
      if (!entry) { return false; }
    }
  }
  for (const key in fileCov.bT) {
    const branchCov = fileCov.bT[key];
    for (const entry of branchCov) {
      if (!entry) { return false; }
    }
  }
  return true;
}

// Fastest known hash method for a string.
export function simpleHash (str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
}