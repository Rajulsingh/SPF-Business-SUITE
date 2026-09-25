export function parseWeightList(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0);
}

export type WeightStats = {
  count: number;
  mean: number;
  min: number;
  max: number;
  cvPercent: number;
};

/** Sample coefficient of variation (%) — the standard uniformity metric for breeder flocks. */
export function computeWeightStats(weights: number[]): WeightStats | null {
  if (weights.length < 2) return null;

  const count = weights.length;
  const mean = weights.reduce((sum, w) => sum + w, 0) / count;
  const variance =
    weights.reduce((sum, w) => sum + (w - mean) ** 2, 0) / (count - 1);
  const stdDev = Math.sqrt(variance);
  const cvPercent = (stdDev / mean) * 100;

  return {
    count,
    mean,
    min: Math.min(...weights),
    max: Math.max(...weights),
    cvPercent,
  };
}
