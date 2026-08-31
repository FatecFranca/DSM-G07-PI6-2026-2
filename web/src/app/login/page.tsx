import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>Entrar</h1>
        <p>Placeholder estático — autenticação JWT será ligada à API NestJS.</p>
        <label className={styles.label} htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          className={styles.field}
          type="email"
          placeholder="produtor@email.com"
          disabled
        />
        <label className={styles.label} htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          className={styles.field}
          type="password"
          placeholder="••••••••"
          disabled
        />
        <button type="button" className={styles.btn} disabled>
          Entrar (em breve)
        </button>
        <div className={styles.links}>
          <Link href="/">Landing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
