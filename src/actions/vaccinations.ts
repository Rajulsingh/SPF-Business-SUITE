import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { getDb } from "@/db/client";
import { vaccinationRecords } from "@/db/schema";
import { requireUser } from "./guard";
import { parseOptionalString } from "@/lib/form";

export const vaccinationsActions = {
  create: defineAction({
    accept: "form",
    input: z.object({
      flockId: z.string().min(1, "Choose a flock."),
      date: z.coerce.date(),
      vaccineName: z.string().min(1, "Vaccine name is required."),
      method: z.string().nullish(),
      batchNumber: z.string().nullish(),
      administeredBy: z.string().nullish(),
      response: z.string().nullish(),
      notes: z.string().nullish(),
    }),
    handler: async (input, context) => {
      await requireUser(context);
      const db = getDb();

      await db.insert(vaccinationRecords).values({
        id: crypto.randomUUID(),
        flockId: input.flockId,
        date: input.date,
        vaccineName: input.vaccineName,
        method: parseOptionalString(input.method),
        batchNumber: parseOptionalString(input.batchNumber),
        administeredBy: parseOptionalString(input.administeredBy),
        response: parseOptionalString(input.response),
        notes: parseOptionalString(input.notes),
        createdAt: new Date(),
      });

      return { success: true as const };
    },
  }),
};
