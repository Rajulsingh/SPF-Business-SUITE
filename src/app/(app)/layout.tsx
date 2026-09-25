import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, canManageFarm } from "@/lib/auth";
import { logoutAction } from "@/actions/auth-actions";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/daily-log", label: "Daily log" },
  { href: "/flocks", label: "Flocks" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const navLinks = canManageFarm(session.role)
    ? [...NAV_LINKS, { href: "/users", label: "Users" }]
    : NAV_LINKS;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">SPF Business Suite</p>
            <p className="text-xs text-slate-500">Breeder farm daily records</p>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">
              {session.name} <span className="text-slate-400">({session.role})</span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
