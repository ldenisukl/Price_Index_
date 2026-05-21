export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 xl:px-0">
        {children}
      </main>
    </div>
  );
}
