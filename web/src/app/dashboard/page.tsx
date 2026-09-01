import Link from "next/link";
import styles from "./dashboard.module.css";

const MOCK_REGIOES = [
  { id: "1", nome: "Sul de Minas", pais: "Brasil" },
  { id: "2", nome: "Cerrado Mineiro", pais: "Brasil" },
  { id: "3", nome: "Mogiana", pais: "Brasil" },
  { id: "4", nome: "Antioquia", pais: "Colômbia" },
];

export default function DashboardPage() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          Café PI
        </Link>
        <nav className={styles.sideNav}>
          <span className={styles.active}>Regiões</span>
          <span>Clima (em breve)</span>
          <span>Safra (em breve)</span>
          <Link href="/login">Login</Link>
          <Link href="/">Voltar à landing</Link>
        </nav>
      </aside>

      <main className={styles.main}>
        <h1>Dashboard</h1>
        <p className={styles.hint}>
          Protótipo estático da Sprint 1 — dados mockados. Integração com a API
          NestJS nas próximas iterações.
        </p>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <h2>Regiões produtoras</h2>
            <ul className={styles.regionList}>
              {MOCK_REGIOES.map((r, i) => (
                <li key={r.id} className={i === 0 ? styles.selected : undefined}>
                  {r.nome}
                  <small>{r.pais}</small>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel}>
            <h2>Série temporal (placeholder)</h2>
            <div className={styles.chartPlaceholder}>
              Gráficos de temperatura, precipitação e rendimento
              <br />
              (região selecionada: Sul de Minas)
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
