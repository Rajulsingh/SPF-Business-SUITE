"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, verifyPassword, type Role } from "@/lib/auth";
import { getString } from "@/lib/form-utils";

export type LoginState = { error: string } | null;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = getString(formData, "username");
  const password = getString(formData, "password");
  const next = getString(formData, "next");

  if (!username || !password) {
    return { error: "Enter both username and password." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Incorrect username or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Incorrect username or password." };
  }

  await createSession({
    userId: user.id,
    name: user.name,
    role: user.role as Role,
  });

  redirect(next && next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
