export default function invariant(condition: any): asserts condition {
  if (!condition) {
    throw new Error('Invariant failed');
  }
}
