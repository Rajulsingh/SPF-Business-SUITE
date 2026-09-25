import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">SPF Business Suite</h1>
        <p className="mt-1 text-sm text-slate-500">
          Breeder farm daily record-keeping
        </p>
        <div className="mt-6">
          <LoginForm next={next ?? "/"} />
        </div>
      </div>
    </div>
  );
}
