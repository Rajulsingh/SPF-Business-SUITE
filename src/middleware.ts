import { defineMiddleware } from "astro:middleware";
import { getSessionUser } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  const user = await getSessionUser(context.session);
  context.locals.user = user;

  if (!user && !isPublic) {
    const redirectUrl = new URL("/login", context.url);
    redirectUrl.searchParams.set("next", pathname);
    return context.redirect(redirectUrl.toString());
  }

  if (user && pathname === "/login") {
    return context.redirect("/");
  }

  return next();
});
