/**
 * Safely get a string value from req.body or req.query (which Express types as string | string[])
 */
export const str = (val: unknown): string | undefined => {
  if (val === undefined || val === null) return undefined;
  if (Array.isArray(val)) return val[0];
  return String(val);
};

/**
 * Safely parse an integer from req.body or req.query
 */
export const int = (val: unknown, fallback?: number): number | undefined => {
  const s = str(val);
  if (s === undefined) return fallback;
  const n = parseInt(s, 10);
  return isNaN(n) ? fallback : n;
};

/**
 * Safely parse a float from req.body or req.query
 */
export const flt = (val: unknown, fallback?: number): number | undefined => {
  const s = str(val);
  if (s === undefined) return fallback;
  const n = parseFloat(s);
  return isNaN(n) ? fallback : n;
};

/**
 * Safely parse a boolean string from req.body or req.query
 */
export const bool = (val: unknown): boolean | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'boolean') return val;
  const s = str(val);
  return s === 'true';
};
