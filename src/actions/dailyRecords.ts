import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { dailyRecords } from "@/db/schema";
import { requireUser } from "./guard";
import { parseOptionalNumber, parseOptionalString } from "@/lib/form";
import { startOfUtcDay } from "@/lib/format";

export const dailyRecordsActions = {
  upsert: defineAction({
    accept: "form",
    input: z.object({
      flockId: z.string().min(1, "Choose a flock."),
      date: z.coerce.date(),
      mortalityCount: z.string().nullish(),
      mortalityCause: z.string().nullish(),
      eggCount: z.string().nullish(),
      gradeACount: z.string().nullish(),
      gradeBCount: z.string().nullish(),
      crackedCount: z.string().nullish(),
      dirtyCount: z.string().nullish(),
      feedConsumedKg: z.string().nullish(),
      waterConsumedLiters: z.string().nullish(),
      tempC: z.string().nullish(),
      humidityPct: z.string().nullish(),
      notes: z.string().nullish(),
    }),
    handler: async (input, context) => {
      const user = await requireUser(context);
      const db = getDb();
      const date = startOfUtcDay(input.date);

      const values = {
        mortalityCount: parseOptionalNumber(input.mortalityCount) ?? 0,
        mortalityCause: parseOptionalString(input.mortalityCause),
        eggCount: parseOptionalNumber(input.eggCount),
        gradeACount: parseOptionalNumber(input.gradeACount),
        gradeBCount: parseOptionalNumber(input.gradeBCount),
        crackedCount: parseOptionalNumber(input.crackedCount),
        dirtyCount: parseOptionalNumber(input.dirtyCount),
        feedConsumedKg: parseOptionalNumber(input.feedConsumedKg),
        waterConsumedLiters: parseOptionalNumber(input.waterConsumedLiters),
        tempC: parseOptionalNumber(input.tempC),
        humidityPct: parseOptionalNumber(input.humidityPct),
        notes: parseOptionalString(input.notes),
        recordedById: user.id,
      };

      const existing = await db.query.dailyRecords.findFirst({
        where: and(eq(dailyRecords.flockId, input.flockId), eq(dailyRecords.date, date)),
      });

      if (existing) {
        await db.update(dailyRecords).set(values).where(eq(dailyRecords.id, existing.id));
      } else {
        await db.insert(dailyRecords).values({
          id: crypto.randomUUID(),
          flockId: input.flockId,
          date,
          createdAt: new Date(),
          ...values,
        });
      }

      return { success: true as const };
    },
  }),
};
