/** Missing configuration selects JSONBin; there is never an automatic failover. */
export function isSqlEnabled(value: unknown): boolean {
  return value === true || (typeof value === 'string' && value.toLowerCase() === 'true');
}
