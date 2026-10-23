"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { saveSession } from "@/lib/session";

const labelClass =
  "grid gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#d9cdb8]";
const inputClass =
  "w-full border border-[#f3ead8]/20 bg-[#0f1a0f]/50 px-3.5 py-3 text-[#f3ead8] outline-none transition focus:border-[#c4a35a]";

export default function RegisterForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (senha.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (!nome.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!email.trim()) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (senha !== confirmacao) {
      setError("A confirmação precisa ser igual à senha.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await api.register(nome.trim(), email.trim(), senha);
      saveSession(session);
      router.replace("/dashboard");
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível conectar à API.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className={labelClass} htmlFor="nome">
        Nome completo
      </label>
      <input
        id="nome"
        name="nome"
        className={inputClass}
        type="text"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        placeholder="Seu nome"
        autoComplete="name"
        required
      />
      <label className={labelClass} htmlFor="email">
        E-mail
      </label>
      <input
        id="email"
        name="email"
        className={inputClass}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="voce@email.com"
        autoComplete="email"
        required
      />
      <label className={labelClass} htmlFor="senha">
        Senha
      </label>
      <input
        id="senha"
        name="senha"
        className={inputClass}
        type="password"
        value={senha}
        onChange={(event) => setSenha(event.target.value)}
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <label className={labelClass} htmlFor="confirmacao">
        Confirmar senha
      </label>
      <input
        id="confirmacao"
        name="confirmacao"
        className={inputClass}
        type="password"
        value={confirmacao}
        onChange={(event) => setConfirmacao(event.target.value)}
        placeholder="Repita a senha"
        autoComplete="new-password"
        required
      />
      {error && <p role="alert" className="text-sm text-[#f0a7a0]">{error}</p>}
      <button
        type="submit"
        className="mt-1 w-full bg-[#c4a35a] px-3.5 py-3.5 font-semibold text-[#0f1a0f] transition hover:bg-[#d8ba70] disabled:cursor-wait disabled:opacity-65"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
