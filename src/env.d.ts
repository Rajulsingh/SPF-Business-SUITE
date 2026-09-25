/// <reference types="astro/client" />

declare namespace App {
  interface SessionData {
    user: {
      id: string;
      name: string;
      role: "OWNER" | "MANAGER" | "WORKER";
    };
  }

  interface Locals {
    user: SessionData["user"] | undefined;
  }
}
