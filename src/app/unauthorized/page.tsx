import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="mt-2 text-zinc-600">You do not have permission to access this page.</p>
        <Link href="/login" className="mt-4 inline-block text-sm underline">Go to login</Link>
      </div>
    </main>
  );
}

