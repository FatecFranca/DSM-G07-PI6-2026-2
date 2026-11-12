import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#121c12] p-8 text-[#f3ead8]">
      <div className="max-w-md text-center">
        <p className="mb-2 text-xs uppercase tracking-widest text-[#c4a35a]">
          Erro 404
        </p>
        <h1 className="mb-3 text-4xl">Página não encontrada</h1>
        <p className="mb-6 text-sm text-[#d9cdb8]/80">
          O endereço não existe ou foi movido. Volte ao início para continuar.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#c4a35a] px-5 py-3 font-semibold text-[#0f1a0f] transition hover:bg-[#d8ba70]"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
