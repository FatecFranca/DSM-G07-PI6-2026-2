import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.hero}>
      <header className={styles.nav}>
        <span className={styles.brand}>Café PI</span>
        <nav className={styles.navLinks}>
          <Link href="/login">Entrar</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <main className={styles.heroMain}>
        <p className={styles.eyebrow}>Grupo 07 · DSM · Sprint 1</p>
        <h1>Clima e produtividade do café, no mesmo lugar.</h1>
        <p className={styles.lead}>
          Cruzamos dados meteorológicos com rendimento das safras para apoiar
          decisões no campo — no dashboard web e, em breve, no app mobile.
        </p>
        <div className={styles.ctaRow}>
          <Link className={styles.btnPrimary} href="/dashboard">
            Ver protótipo do dashboard
          </Link>
          <Link className={styles.btnGhost} href="/login">
            Login (placeholder)
          </Link>
        </div>
      </main>
    </div>
  );
}
