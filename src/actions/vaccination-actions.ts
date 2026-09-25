"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { getString, getOptionalString, getRequiredDate } from "@/lib/form-utils";
import type { ActionState } from "@/actions/action-state";

export async function createVaccinationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  try {
    const flockId = getString(formData, "flockId");
    if (!flockId) return { error: "Choose a flock." };

    const vaccineName = getString(formData, "vaccineName");
    if (!vaccineName) return { error: "Vaccine name is required." };

    await prisma.vaccinationRecord.create({
      data: {
        flockId,
        date: getRequiredDate(formData, "date"),
        vaccineName,
        method: getOptionalString(formData, "method"),
        batchNumber: getOptionalString(formData, "batchNumber"),
        administeredBy: getOptionalString(formData, "administeredBy"),
        notes: getOptionalString(formData, "notes"),
      },
    });

    revalidatePath(`/flocks/${flockId}`);
    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save the vaccination record.",
    };
  }
}
