"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession, canManageFarm } from "@/lib/auth";
import {
  getString,
  getOptionalString,
  getRequiredNumber,
  getRequiredDate,
} from "@/lib/form-utils";
import type { ActionState } from "@/actions/action-state";

export async function createFlockAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  if (!canManageFarm(session.role)) {
    return { error: "Only owners and managers can create flocks." };
  }

  try {
    const name = getString(formData, "name");
    if (!name) return { error: "Flock name is required." };

    await prisma.flock.create({
      data: {
        name,
        breed: getOptionalString(formData, "breed"),
        source: getOptionalString(formData, "source"),
        housingType: getOptionalString(formData, "housingType"),
        placedOn: getRequiredDate(formData, "placedOn"),
        initialCount: getRequiredNumber(formData, "initialCount"),
        notes: getOptionalString(formData, "notes"),
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create flock." };
  }

  revalidatePath("/flocks");
  return { success: true };
}

export async function updateFlockStatusAction(flockId: string, status: string) {
  const session = await requireSession();
  if (!canManageFarm(session.role)) {
    throw new Error("Only owners and managers can change flock status.");
  }
  await prisma.flock.update({ where: { id: flockId }, data: { status } });
  revalidatePath("/flocks");
  revalidatePath(`/flocks/${flockId}`);
}
