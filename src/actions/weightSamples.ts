import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { getDb } from "@/db/client";
import { bodyWeightSamples } from "@/db/schema";
import { requireUser } from "./guard";
import { parseOptionalNumber, parseOptionalString } from "@/lib/form";
import { parseWeightList, computeWeightStats } from "@/lib/stats";

export const weightSamplesActions = {
  create: defineAction({
    accept: "form",
    input: z.object({
      flockId: z.string().min(1, "Choose a flock."),
      date: z.coerce.date(),
      ageWeeks: z.string().nullish(),
      targetCvPercent: z.string().nullish(),
      rawWeightsG: z.string().nullish(),
      sampleSize: z.string().nullish(),
      avgWeightG: z.string().nullish(),
      cvPercent: z.string().nullish(),
      notes: z.string().nullish(),
    }),
    handler: async (input, context) => {
      await requireUser(context);
      const db = getDb();

      const targetCvPercent = parseOptionalNumber(input.targetCvPercent) ?? 12;
      const rawWeightsInput = input.rawWeightsG ?? "";
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
        const manualAvg = parseOptionalNumber(input.avgWeightG);
        const manualSampleSize = parseOptionalNumber(input.sampleSize);
        if (!manualAvg || !manualSampleSize) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message:
              "Enter either a list of individual weights, or both an average weight and sample size.",
          });
        }
        sampleSize = manualSampleSize;
        avgWeightG = manualAvg;
        cvPercent = parseOptionalNumber(input.cvPercent);
      }

      await db.insert(bodyWeightSamples).values({
        id: crypto.randomUUID(),
        flockId: input.flockId,
        date: input.date,
        ageWeeks: parseOptionalNumber(input.ageWeeks),
        sampleSize,
        avgWeightG,
        minWeightG,
        maxWeightG,
        cvPercent,
        targetCvPercent,
        rawWeightsG: rawWeightsInput || null,
        notes: parseOptionalString(input.notes),
        createdAt: new Date(),
      });

      return { success: true as const };
    },
  }),
};
