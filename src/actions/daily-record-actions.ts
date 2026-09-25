"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import {
  getString,
  getOptionalString,
  getOptionalNumber,
  getRequiredDate,
} from "@/lib/form-utils";
import type { ActionState } from "@/actions/action-state";

export async function upsertDailyRecordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();

  try {
    const flockId = getString(formData, "flockId");
    if (!flockId) return { error: "Choose a flock." };

    const date = getRequiredDate(formData, "date");
    // Store as a date-only value so the [flockId, date] uniqueness lines up
    // regardless of the time of day the entry is submitted.
    date.setUTCHours(0, 0, 0, 0);

    await prisma.dailyRecord.upsert({
      where: { flockId_date: { flockId, date } },
      create: {
        flockId,
        date,
        mortalityCount: getOptionalNumber(formData, "mortalityCount") ?? 0,
        mortalityCause: getOptionalString(formData, "mortalityCause"),
        eggCount: getOptionalNumber(formData, "eggCount"),
        feedConsumedKg: getOptionalNumber(formData, "feedConsumedKg"),
        waterConsumedLiters: getOptionalNumber(formData, "waterConsumedLiters"),
        tempC: getOptionalNumber(formData, "tempC"),
        humidityPct: getOptionalNumber(formData, "humidityPct"),
        notes: getOptionalString(formData, "notes"),
        recordedById: session.userId,
      },
      update: {
        mortalityCount: getOptionalNumber(formData, "mortalityCount") ?? 0,
        mortalityCause: getOptionalString(formData, "mortalityCause"),
        eggCount: getOptionalNumber(formData, "eggCount"),
        feedConsumedKg: getOptionalNumber(formData, "feedConsumedKg"),
        waterConsumedLiters: getOptionalNumber(formData, "waterConsumedLiters"),
        tempC: getOptionalNumber(formData, "tempC"),
        humidityPct: getOptionalNumber(formData, "humidityPct"),
        notes: getOptionalString(formData, "notes"),
        recordedById: session.userId,
      },
    });

    revalidatePath("/daily-log");
    revalidatePath(`/flocks/${flockId}`);
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save today's record.",
    };
  }
}
