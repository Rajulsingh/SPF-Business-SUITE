const MS_PER_DAY = 1000 * 60 * 60 * 24;
const HEN_DAY_PRODUCTION_THRESHOLD = 0.05; // 5% hen-day production, the industry checkpoint

export function targetPhotostimulationDate(placedOn: Date, targetWeek: number): Date {
  const target = new Date(placedOn);
  target.setUTCDate(target.getUTCDate() + targetWeek * 7);
  return target;
}

export type PhotostimulationStatus = "on-time" | "early" | "late";

export function photostimulationDelta(
  targetDate: Date,
  actualDate: Date
): { days: number; status: PhotostimulationStatus } {
  const days = Math.round((actualDate.getTime() - targetDate.getTime()) / MS_PER_DAY);
  // Within a few days either side is normal variation, not a real deviation.
  const status: PhotostimulationStatus = days > 3 ? "late" : days < -3 ? "early" : "on-time";
  return { days, status };
}

/**
 * Finds the first date a flock's egg count crossed the 5% hen-day production
 * threshold, ordered ascending — the industry checkpoint for confirming
 * photostimulation is producing the expected response. Records should
 * already be sorted by date ascending.
 */
export function findFirstHenDayThresholdCrossing(
  records: { date: Date; eggCount: number | null }[],
  initialCount: number
): Date | null {
  if (initialCount <= 0) return null;
  for (const record of records) {
    if (record.eggCount == null) continue;
    if (record.eggCount / initialCount >= HEN_DAY_PRODUCTION_THRESHOLD) {
      return record.date;
    }
  }
  return null;
}

export function ageInWeeks(placedOn: Date, at: Date): number {
  return Math.floor((at.getTime() - placedOn.getTime()) / MS_PER_DAY / 7);
}
