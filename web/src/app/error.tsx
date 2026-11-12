"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#121c12] p-8 text-[#f3ead8]">
      <div className="max-w-md text-center" role="alert">
        <p className="mb-2 text-xs uppercase tracking-widest text-[#c4a35a]">
          Algo deu errado
        </p>
        <h1 className="mb-3 text-4xl">Não foi possível exibir esta página</h1>
        <p className="mb-6 text-sm text-[#d9cdb8]/80">
          Tente novamente. Se o problema continuar, verifique se a API está em
          execução.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="bg-[#c4a35a] px-5 py-3 font-semibold text-[#0f1a0f] transition hover:bg-[#d8ba70]"
          >
            Tentar novamente
          </button>
          <Link href="/" className="border border-white/15 px-5 py-3">
            Ir para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
