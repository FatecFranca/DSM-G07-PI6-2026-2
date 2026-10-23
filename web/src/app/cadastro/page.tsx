import Link from "next/link";
import RegisterForm from "./register-form";

export default function CadastroPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#152415] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(107,143,113,0.28),transparent_60%)] p-8">
      <div className="w-full max-w-[400px] border border-[#f3ead8]/12 bg-[#182418]/90 p-8">
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#c4a35a]">Plataforma agrícola</p>
        <h1 className="mb-1 font-[family-name:var(--font-display)] text-3xl font-medium">Criar conta</h1>
        <p className="mb-6 text-sm text-[#d9cdb8]">
          Cadastre-se para consultar clima, produção e análise por município.
        </p>
        <RegisterForm />
        <p className="mt-4 border-l-2 border-[#c4a35a] pl-3 text-xs text-[#d9cdb8]/75">
          A conta será criada como produtor e você será direcionado ao painel após o cadastro.
        </p>
        <div className="mt-5 flex justify-between text-sm text-[#d9cdb8]">
          <Link href="/">Home</Link>
          <Link href="/login">Já tenho conta</Link>
        </div>
      </div>
    </div>
  );
}
