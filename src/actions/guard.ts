import { ActionError } from "astro:actions";
import type { ActionAPIContext } from "astro:actions";
import { getSessionUser, canManageFarm, type SessionUser } from "@/lib/auth";

export async function requireUser(context: ActionAPIContext): Promise<SessionUser> {
  const user = await getSessionUser(context.session);
  if (!user) {
    throw new ActionError({ code: "UNAUTHORIZED", message: "Please log in." });
  }
  return user;
}

export async function requireManager(context: ActionAPIContext): Promise<SessionUser> {
  const user = await requireUser(context);
  if (!canManageFarm(user.role)) {
    throw new ActionError({
      code: "FORBIDDEN",
      message: "Only owners and managers can do this.",
    });
  }
  return user;
}

export async function requireOwner(context: ActionAPIContext): Promise<SessionUser> {
  const user = await requireUser(context);
  if (user.role !== "OWNER") {
    throw new ActionError({ code: "FORBIDDEN", message: "Only the owner can do this." });
  }
  return user;
}
