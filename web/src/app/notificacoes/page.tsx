"use client";

import { useEffect, useState } from "react";
import { ApiError, Notificacao, api } from "@/lib/api";
import { clearSession, readSession } from "@/lib/session";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = readSession();
    if (!session) {
      window.location.replace("/login");
      return;
    }
    let active = true;
    const load = () => api.notificacoes(session.accessToken).then((items) => {
      if (active) setNotifications(items);
    }).catch((requestError: unknown) => {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearSession();
        window.location.replace("/login");
      } else if (active) setError("Não foi possível carregar as notificações.");
    });
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  async function markAsRead(id: string) {
    const session = readSession();
    if (!session) return;
    await api.marcarNotificacaoLida(session.accessToken, id);
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, lidaEm: new Date().toISOString(), status: "READ" } : item));
  }

  return (
    <main className="min-h-screen bg-[#132013] px-6 py-10 text-[#f3ead8]">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">Mensagens de clima</h1>
        <p className="mt-2 text-sm text-[#c8d2bd]">Atualização automática a cada minuto. Ative os canais nas preferências quando disponíveis.</p>
        {error && <p className="mt-6 border border-red-300/30 bg-red-950/30 p-4 text-sm">{error}</p>}
        <div className="mt-8 space-y-3">
          {notifications.length === 0 && !error && <p className="text-sm text-[#c8d2bd]">Nenhuma notificação recebida.</p>}
          {notifications.map((notification) => (
            <article key={notification.id} className={`border border-[#f3ead8]/10 bg-[#243824]/70 p-5 ${notification.lidaEm ? "opacity-70" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{notification.titulo}</h2>
                  <p className="mt-2 text-sm text-[#d9e2d0]">{notification.mensagem}</p>
                  <p className="mt-3 text-xs text-[#aebca4]">{formatDate(notification.criadoEm)} · {notification.canal}</p>
                </div>
                {!notification.lidaEm && <button className="text-xs underline" onClick={() => void markAsRead(notification.id)}>Marcar como lida</button>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
