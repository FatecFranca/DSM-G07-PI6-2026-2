import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, ApiError, AuthResponse } from '../api';
import { saveSession } from '../session';
import { styles } from '../styles';

interface LoginScreenProps {
  onLogin: (session: AuthResponse) => void;
  onCreateAccount: () => void;
}

export function LoginScreen({ onLogin, onCreateAccount }: LoginScreenProps) {
  const [email, setEmail] = useState('tecnico@cafe-pi.local');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const response = await api.login(email.trim(), senha);
      await saveSession(response);
      onLogin(response);
    } catch (error) {
      Alert.alert(
        'Não foi possível entrar',
        error instanceof ApiError ? error.message : 'Verifique a conexão com a API.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>PLATAFORMA AGRÍCOLA</Text>
        <Text style={styles.title}>Inteligência para sua produção</Text>
        <Text style={styles.subtitle}>
          Acesse dados de clima, produção e análise por município.
        </Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
        />
        <Pressable disabled={loading} onPress={handleLogin} style={styles.primaryButton}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>
        <Pressable onPress={onCreateAccount}>
          <Text style={styles.link}>Ainda não tem conta? Criar conta</Text>
        </Pressable>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
