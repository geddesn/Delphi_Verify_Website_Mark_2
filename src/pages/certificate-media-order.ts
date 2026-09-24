export function sortMediaForDisplay<T extends { index: number }>(
  media: readonly T[],
  displayMediaOrder?: readonly number[] | null,
): T[] {
  const positions = new Map(
    displayMediaOrder?.map((index, position) => [index, position] as const),
  );
  const fallback = displayMediaOrder?.length ?? 0;
  return [...media].sort(
    (a, b) =>
      (positions.get(a.index) ?? fallback + a.index) -
      (positions.get(b.index) ?? fallback + b.index),
  );
}
