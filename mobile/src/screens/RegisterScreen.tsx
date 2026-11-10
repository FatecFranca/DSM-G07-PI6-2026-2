import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import { api, ApiError, AuthResponse } from '../api';
import { saveSession } from '../session';
import { styles } from '../styles';

interface RegisterScreenProps {
  onRegister: (session: AuthResponse) => void;
  onBack: () => void;
}

export function RegisterScreen({ onRegister, onBack }: RegisterScreenProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Preencha os campos', 'Informe seu nome e seu e-mail.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Senha muito curta', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmacao) {
      Alert.alert('Senhas diferentes', 'A confirmação precisa ser igual à senha.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(nome.trim(), email.trim(), senha);
      await saveSession(response);
      onRegister(response);
    } catch (error) {
      Alert.alert(
        'Não foi possível criar a conta',
        error instanceof ApiError ? error.message : 'Verifique a conexão com a API.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>PLATAFORMA AGRÍCOLA</Text>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Cadastre-se para consultar clima, produção e análise por município.
        </Text>
        <TextInput
          autoCapitalize="words"
          placeholder="Nome completo"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Senha (mínimo 6 caracteres)"
          secureTextEntry
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
        />
        <TextInput
          placeholder="Confirmar senha"
          secureTextEntry
          style={styles.input}
          value={confirmacao}
          onChangeText={setConfirmacao}
        />
        <Pressable disabled={loading} onPress={handleRegister} style={styles.primaryButton}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </Pressable>
        <Pressable onPress={onBack}>
          <Text style={styles.link}>Já tenho conta? Entrar</Text>
        </Pressable>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
