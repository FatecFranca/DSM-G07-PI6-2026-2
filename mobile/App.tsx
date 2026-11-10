/**
 * App.tsx — roteador de telas.
 *
 * Responsabilidade única: decidir qual tela exibir com base no estado
 * de sessão e de navegação. Toda a lógica de UI e de API fica nas telas.
 *
 * Fluxo:
 *   checkingSession → LoadingScreen
 *   !session + !showRegister → LoginScreen
 *   !session + showRegister  → RegisterScreen
 *   session + !selectedRegiao → HomeScreen
 *   session + selectedRegiao  → RegionDetailScreen
 */
import { useEffect, useState } from 'react';
import type { AuthResponse, Regiao } from './src/api';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RegionDetailScreen } from './src/screens/RegionDetailScreen';
import { clearSession, loadSession } from './src/session';

export default function App() {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedRegiao, setSelectedRegiao] = useState<Regiao | null>(null);

  useEffect(() => {
    loadSession()
      .then(setSession)
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return <LoadingScreen />;
  }

  if (!session) {
    if (showRegister) {
      return (
        <RegisterScreen
          onRegister={(s) => { setSession(s); setShowRegister(false); }}
          onBack={() => setShowRegister(false)}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={setSession}
        onCreateAccount={() => setShowRegister(true)}
      />
    );
  }

  if (selectedRegiao) {
    return (
      <RegionDetailScreen
        regiao={selectedRegiao}
        token={session.accessToken}
        onBack={() => setSelectedRegiao(null)}
      />
    );
  }

  return (
    <HomeScreen
      session={session}
      onSelectRegiao={setSelectedRegiao}
      onLogout={async () => {
        await clearSession();
        setSession(null);
        setSelectedRegiao(null);
      }}
    />
  );
}
