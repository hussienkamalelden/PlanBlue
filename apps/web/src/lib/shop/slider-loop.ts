export function buildInfiniteSliderItems<T>(
  items: T[],
  minCount: number,
): Array<{ data: T; slideKey: string; sourceIndex: number }> {
  if (items.length === 0) {
    return [];
  }

  const targetCount = Math.max(minCount, items.length);
  const result: Array<{ data: T; slideKey: string; sourceIndex: number }> = [];

  for (let index = 0; index < targetCount; index += 1) {
    const sourceIndex = index % items.length;

    result.push({
      data: items[sourceIndex],
      slideKey: `${sourceIndex}-${index}`,
      sourceIndex,
    });
  }

  return result;
}
