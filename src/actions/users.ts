import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { requireOwner } from "./guard";
import { hashPassword } from "@/lib/auth";

export const usersActions = {
  create: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required."),
      username: z.string().min(1, "Username is required."),
      password: z.string().min(6, "Password must be at least 6 characters."),
      role: z.enum(["OWNER", "MANAGER", "WORKER"]),
    }),
    handler: async (input, context) => {
      await requireOwner(context);
      const db = getDb();

      const existing = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });
      if (existing) {
        throw new ActionError({
          code: "CONFLICT",
          message: "That username is already taken.",
        });
      }

      await db.insert(users).values({
        id: crypto.randomUUID(),
        name: input.name,
        username: input.username,
        role: input.role,
        passwordHash: await hashPassword(input.password),
        createdAt: new Date(),
      });

      return { success: true as const };
    },
  }),
};
