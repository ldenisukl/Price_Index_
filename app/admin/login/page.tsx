export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Admin Login</h1>
        <p className="mt-4 text-slate-300">Conectează-te pentru a gestiona categorii, itemuri și contribuții.</p>
        <form className="mt-8 space-y-5">
          <label className="block text-sm text-slate-300">
            Email
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none" type="email" />
          </label>
          <label className="block text-sm text-slate-300">
            Parolă
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none" type="password" />
          </label>
          <button className="inline-flex w-full justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
            Conectează-te
          </button>
        </form>
      </div>
    </main>
  );
}
