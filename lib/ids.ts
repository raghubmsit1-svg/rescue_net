export function makeId(prefix: string): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${n}`;
}
