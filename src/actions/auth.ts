import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth";

export const auth = {
  login: defineAction({
    accept: "form",
    input: z.object({
      username: z.string().min(1),
      password: z.string().min(1),
      next: z.string().optional(),
    }),
    handler: async ({ username, password, next }, context) => {
      const db = getDb();
      const user = await db.query.users.findFirst({ where: eq(users.username, username) });

      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Incorrect username or password.",
        });
      }

      context.session?.set("user", {
        id: user.id,
        name: user.name,
        role: user.role as "OWNER" | "MANAGER" | "WORKER",
      });

      const redirectTo = next && next.startsWith("/") ? next : "/";
      return { redirectTo };
    },
  }),
};
