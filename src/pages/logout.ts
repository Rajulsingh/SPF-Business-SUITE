import type { APIContext } from "astro";

export const prerender = false;

export async function POST(context: APIContext) {
  context.session?.destroy();
  return context.redirect("/login");
}
