"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession, hashPassword } from "@/lib/auth";
import { getString } from "@/lib/form-utils";
import type { ActionState } from "@/actions/action-state";

const VALID_ROLES = new Set(["OWNER", "MANAGER", "WORKER"]);

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  if (session.role !== "OWNER") {
    return { error: "Only the owner can add users." };
  }

  try {
    const name = getString(formData, "name");
    const username = getString(formData, "username");
    const password = getString(formData, "password");
    const role = getString(formData, "role");

    if (!name || !username || !password) {
      return { error: "Name, username, and password are all required." };
    }
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }
    if (!VALID_ROLES.has(role)) {
      return { error: "Choose a valid role." };
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return { error: "That username is already taken." };
    }

    await prisma.user.create({
      data: {
        name,
        username,
        role,
        passwordHash: await hashPassword(password),
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create user." };
  }

  revalidatePath("/users");
  return { success: true };
}
