import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { flocks } from "@/db/schema";
import { requireManager } from "./guard";

export const flocksActions = {
  create: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Flock name is required."),
      breed: z.string().optional(),
      source: z.string().optional(),
      housingType: z.string().optional(),
      placedOn: z.coerce.date(),
      initialCount: z.coerce.number().int().positive(),
      notes: z.string().optional(),
    }),
    handler: async (input, context) => {
      await requireManager(context);
      const db = getDb();
      const now = new Date();

      await db.insert(flocks).values({
        id: crypto.randomUUID(),
        name: input.name,
        breed: input.breed || null,
        source: input.source || null,
        housingType: input.housingType || null,
        placedOn: input.placedOn,
        initialCount: input.initialCount,
        notes: input.notes || null,
        createdAt: now,
        updatedAt: now,
      });

      return { success: true as const };
    },
  }),

  updateStatus: defineAction({
    accept: "form",
    input: z.object({
      flockId: z.string().min(1),
      status: z.enum(["ACTIVE", "ARCHIVED"]),
    }),
    handler: async ({ flockId, status }, context) => {
      await requireManager(context);
      const db = getDb();
      await db
        .update(flocks)
        .set({ status, updatedAt: new Date() })
        .where(eq(flocks.id, flockId));

      return { success: true as const };
    },
  }),
};
