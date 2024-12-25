const prefix: string = 'Invariant failed';

export default function invariant(
  condition: any,
  message?: string | (() => string),
): asserts condition {
  if (condition) {
    return;
  }

  const provided = typeof message === 'function' ? message() : message;
  const value = provided ? `${prefix}: ${provided}` : prefix;
  throw new Error(value);
}
