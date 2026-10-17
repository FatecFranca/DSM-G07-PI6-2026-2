"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { saveSession } from "@/lib/session";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await api.login(email, senha);
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
      <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#d9cdb8]" htmlFor="email">
        E-mail
      </label>
      <input
        id="email"
        className="w-full border border-[#f3ead8]/20 bg-[#0f1a0f]/50 px-3.5 py-3 text-[#f3ead8] outline-none transition focus:border-[#c4a35a]"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="tecnico@cafe-pi.local"
        autoComplete="email"
        required
      />
      <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#d9cdb8]" htmlFor="senha">
        Senha
      </label>
      <input
        id="senha"
        className="w-full border border-[#f3ead8]/20 bg-[#0f1a0f]/50 px-3.5 py-3 text-[#f3ead8] outline-none transition focus:border-[#c4a35a]"
        type="password"
        value={senha}
        onChange={(event) => setSenha(event.target.value)}
        placeholder="Sua senha"
        autoComplete="current-password"
        required
      />
      {error && <p className="text-sm text-[#f0a7a0]">{error}</p>}
      <button
        type="submit"
        className="mt-1 w-full bg-[#c4a35a] px-3.5 py-3.5 font-semibold text-[#0f1a0f] transition hover:bg-[#d8ba70] disabled:cursor-wait disabled:opacity-65"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
