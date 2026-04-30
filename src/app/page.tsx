import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10">
      <section className="rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.2em]">AngkatanPass</p>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">
          Sistem Tiket QR & Galeri Foto Angkatan
        </h1>
        <p className="mt-4 max-w-2xl text-white/90">
          Untuk panitia, gate crew, fotografer, dan peserta. Semua alur acara dalam satu aplikasi.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link href="/login" className="block"><Button variant="secondary" className="w-full">1. Login Panitia</Button></Link>
          <Link href="/register/demo-event" className="block"><Button className="w-full bg-white text-rose-700 hover:bg-rose-50">2. Registrasi Peserta</Button></Link>
          <Link href="/lookup" className="block"><Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800">3. Cek Tiket Peserta</Button></Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-zinc-900">
          <p className="text-xs font-semibold uppercase text-zinc-500">Langkah 1</p>
          <h3 className="mt-1 font-semibold">Buat Event</h3>
          <p className="mt-2 text-sm text-zinc-600">Masuk ke Dashboard lalu isi nama event, slug, tanggal, dan lokasi.</p>
        </Card>
        <Card className="border-l-4 border-l-zinc-900">
          <p className="text-xs font-semibold uppercase text-zinc-500">Langkah 2</p>
          <h3 className="mt-1 font-semibold">Tambah Peserta</h3>
          <p className="mt-2 text-sm text-zinc-600">Input manual atau import CSV. Tiket QR akan tergenerate otomatis.</p>
        </Card>
        <Card className="border-l-4 border-l-zinc-900">
          <p className="text-xs font-semibold uppercase text-zinc-500">Langkah 3</p>
          <h3 className="mt-1 font-semibold">Scan di Gate</h3>
          <p className="mt-2 text-sm text-zinc-600">Gate crew buka Scanner mode Entry Check-In dan scan QR peserta.</p>
        </Card>
        <Card className="border-l-4 border-l-zinc-900">
          <p className="text-xs font-semibold uppercase text-zinc-500">Langkah 4</p>
          <h3 className="mt-1 font-semibold">Upload Foto</h3>
          <p className="mt-2 text-sm text-zinc-600">Fotografer scan mode Photo Booth, upload foto, lalu publish yang visible.</p>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <h3 className="font-semibold">Untuk Gate Crew</h3>
          <p className="mt-2 text-sm text-zinc-600">Gunakan hanya menu Scanner. Hijau = valid, kuning = sudah dipakai, merah = tolak.</p>
          <Link href="/dashboard/scanner" className="mt-3 inline-block text-sm font-medium underline">Buka Scanner</Link>
        </Card>
        <Card>
          <h3 className="font-semibold">Untuk Admin</h3>
          <p className="mt-2 text-sm text-zinc-600">Kelola event, peserta, import/export CSV, reissue/revoke tiket, dan audit log scan.</p>
          <Link href="/dashboard" className="mt-3 inline-block text-sm font-medium underline">Buka Dashboard</Link>
        </Card>
        <Card>
          <h3 className="font-semibold">Untuk Peserta</h3>
          <p className="mt-2 text-sm text-zinc-600">Buka link tiket untuk menampilkan QR. Setelah acara, buka galeri dari link yang sama.</p>
          <Link href="/lookup" className="mt-3 inline-block text-sm font-medium underline">Cari Tiket</Link>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card><h3 className="font-semibold">Gate-Ready Scanner</h3><p className="mt-2 text-sm text-zinc-600">Mobile-first UI with clear success/warning/error states and manual fallback.</p></Card>
        <Card><h3 className="font-semibold">Token-Safe by Design</h3><p className="mt-2 text-sm text-zinc-600">Only hashed ticket tokens are stored. QR contains no personal data.</p></Card>
        <Card><h3 className="font-semibold">Photo Delivery</h3><p className="mt-2 text-sm text-zinc-600">Upload and assign photos securely to participant/class/session visibility scopes.</p></Card>
      </section>
    </main>
  );
}
