import Link from "next/link";

const signals = [
  { title: "Clima municipal", text: "Sazonalidade, chuva e temperatura reunidas em uma leitura simples." },
  { title: "Histórico de safra", text: "Produção e rendimento organizados por cultura e ano." },
  { title: "Culturas compatíveis", text: "Resultados analíticos apresentados com contexto e transparência." },
];

export default function Home() {
  return (
    <main className="min-h-[100svh] bg-[#f3ead8] text-[#0f1a0f]">
      <section className="grid min-h-[100svh] grid-rows-[auto_1fr_auto] overflow-x-clip bg-[#1a2e1a] px-5 py-6 text-[#f3ead8] sm:px-10 lg:px-16">
        <header className="flex items-center justify-between pb-5">
          <Link href="/" className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.03em]" aria-label="Plataforma agrícola - início">Plataforma agrícola</Link>
          <nav className="flex items-center gap-5 text-sm sm:gap-8" aria-label="Navegação principal">
            <Link href="/login">Entrar</Link>
            <Link href="/cadastro" className="bg-[#c4a35a] px-4 py-2.5 font-semibold !text-[#0f1a0f]">Cadastre-se</Link>
          </nav>
        </header>

        <div className="grid items-center gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,.65fr)] lg:py-32">
          <div className="max-w-3xl">
            <h1 className="max-w-[11ch] font-[family-name:var(--font-display)] text-[clamp(3.4rem,9vw,8.5rem)] font-[450] leading-[0.9] tracking-[-0.075em]">Tenha mais assertividade no campo</h1>
            <p className="my-8 max-w-xl text-[clamp(1rem,1.5vw,1.2rem)] leading-relaxed text-[#d9cdb8]">Uma visão municipal para conectar clima, produção e escolhas de cultivo em um só lugar.</p>
            <div className="flex flex-wrap items-center gap-5">
              <Link className="bg-[#c4a35a] px-5 py-4 font-bold !text-[#0f1a0f] transition hover:-translate-y-0.5 hover:bg-[#d8ba70]" href="/cadastro">Criar minha conta</Link>
              <Link className="text-sm text-[#f3ead8] transition hover:text-[#c4a35a]" href="/login">Já tenho conta <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <div className="relative grid aspect-square w-[min(28rem,100%)] max-w-full place-content-center justify-items-center gap-5 justify-self-end rounded-full bg-[#c4a35a]/20 [transform:rotate(-14deg)] max-sm:w-[min(18rem,72vw)]">
            <span className="absolute h-[72%] w-[72%] rounded-full bg-[#1a2e1a]" />
            <span className="absolute h-[42%] w-[42%] rounded-full bg-[#c4a35a]/35" />
            <span className="z-10 h-0.5 w-[55%] bg-[#f3ead8]/65" /><span className="z-10 h-0.5 w-[55%] bg-[#f3ead8]/65" />
            <span className="z-10 h-0.5 w-[55%] bg-[#f3ead8]/65" /><span className="z-10 h-0.5 w-[55%] bg-[#f3ead8]/65" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 text-xs tracking-wide text-[#d9cdb8]"><span>Dados por município</span><span>ES · MG · SP</span></div>
      </section>

      <section className="grid gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[minmax(15rem,.8fr)_minmax(0,1.2fr)] lg:gap-40 lg:px-32 lg:py-40">
        <div className="max-w-md">
          <h2 className="mb-6 max-w-[12ch] font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,5rem)] font-[450] leading-[0.95] tracking-[-0.06em]">Do dado à decisão.</h2>
          <p className="leading-relaxed text-[#5a5144]">Consulte informações de referência e resultados analíticos sem perder de vista a realidade de cada município.</p>
        </div>
        <div className="self-center" data-ui="feature-list">
          {signals.map((signal) => (
            <article className="mb-3 grid grid-cols-[1fr_auto] gap-x-8 gap-y-2 bg-[#0f1a0f]/[0.06] p-6 last:mb-0" key={signal.title}>
              <h3 className="text-[clamp(1.25rem,2vw,1.75rem)] font-medium">{signal.title}</h3><p className="max-w-lg leading-relaxed text-[#5a5144]">{signal.text}</p><span className="col-start-2 row-span-2 row-start-1 self-center text-2xl text-[#3d2b1f]" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="flex flex-col items-start gap-4 bg-[#3d2b1f] px-5 py-6 text-sm text-[#f3ead8] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <span className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.03em] text-[#c4a35a]">Plataforma agrícola</span>
        <span className="text-[#d9cdb8]">Dados que ajudam a ler cada município.</span>
        <Link className="transition hover:text-[#c4a35a]" href="/cadastro">Começar agora ↗</Link>
      </footer>
    </main>
  );
}
