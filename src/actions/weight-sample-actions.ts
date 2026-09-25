"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { getString, getOptionalString, getOptionalNumber, getRequiredDate } from "@/lib/form-utils";
import { parseWeightList, computeWeightStats } from "@/lib/stats";
import type { ActionState } from "@/actions/action-state";

export async function createWeightSampleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  try {
    const flockId = getString(formData, "flockId");
    if (!flockId) return { error: "Choose a flock." };

    const date = getRequiredDate(formData, "date");
    const targetCvPercent = getOptionalNumber(formData, "targetCvPercent") ?? 12;
    const rawWeightsInput = getString(formData, "rawWeightsG");
    const weights = parseWeightList(rawWeightsInput);
    const stats = computeWeightStats(weights);

    let sampleSize: number;
    let avgWeightG: number;
    let minWeightG: number | null = null;
    let maxWeightG: number | null = null;
    let cvPercent: number | null = null;

    if (stats) {
      sampleSize = stats.count;
      avgWeightG = Math.round(stats.mean * 10) / 10;
      minWeightG = stats.min;
      maxWeightG = stats.max;
      cvPercent = Math.round(stats.cvPercent * 100) / 100;
    } else {
      const manualAvg = getOptionalNumber(formData, "avgWeightG");
      const manualSampleSize = getOptionalNumber(formData, "sampleSize");
      if (!manualAvg || !manualSampleSize) {
        return {
          error:
            "Enter either a list of individual weights, or both an average weight and sample size.",
        };
      }
      sampleSize = manualSampleSize;
      avgWeightG = manualAvg;
      cvPercent = getOptionalNumber(formData, "cvPercent");
    }

    await prisma.bodyWeightSample.create({
      data: {
        flockId,
        date,
        ageWeeks: getOptionalNumber(formData, "ageWeeks"),
        sampleSize,
        avgWeightG,
        minWeightG,
        maxWeightG,
        cvPercent,
        targetCvPercent,
        rawWeightsG: rawWeightsInput || null,
        notes: getOptionalString(formData, "notes"),
      },
    });

    revalidatePath(`/flocks/${flockId}`);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save the weight sample.",
    };
  }
}
