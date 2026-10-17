import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#152415] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(107,143,113,0.28),transparent_60%)] p-8">
      <div className="w-full max-w-[400px] border border-[#f3ead8]/12 bg-[#182418]/90 p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#c4a35a]">Café PI</p>
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-3xl font-medium">Entrar</h1>
        <p className="mb-6 text-sm text-[#d9cdb8]">
          Acesse os dados climáticos e de produtividade das regiões produtoras.
        </p>
        <LoginForm />
        <div className="mt-5 flex justify-between text-sm text-[#d9cdb8]">
          <Link href="/">Landing</Link>
        </div>
      </div>
    </div>
  );
}
