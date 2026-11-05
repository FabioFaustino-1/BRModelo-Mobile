import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from 'react-native';

import { initDatabase } from './src/database/index.js';
import { THEME } from './src/constants/theme.js';
import { HomeScreen } from './src/screens/HomeScreen.js';
import { ProjectScreen } from './src/screens/ProjectScreen.js';
import { EntityScreen } from './src/screens/EntityScreen.js';

export default function App() {
  const [dbState, setDbState] = useState({
    isLoading: true,
    isReady: false,
    error: null,
  });

  // Pilha de navegação: [{ name: 'Home' | 'Project' | 'Entity', params: {} }]
  const [stack, setStack] = useState([{ name: 'Home', params: {} }]);

  const startDatabase = useCallback(async () => {
    setDbState({ isLoading: true, isReady: false, error: null });
    try {
      await initDatabase();
      setDbState({ isLoading: false, isReady: true, error: null });
    } catch (err) {
      setDbState({ isLoading: false, isReady: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    startDatabase();
  }, [startDatabase]);

  // Suporte ao botão 'Voltar' físico do Android
  useEffect(() => {
    const onBackPress = () => {
      if (stack.length > 1) {
        handleGoBack();
        return true;
      }
      return false; // Sai do app se estiver na Home
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => subscription.remove();
  }, [stack]);

  function handleNavigate(name, params = {}) {
    setStack((prev) => [...prev, { name, params }]);
  }

  function handleGoBack() {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  }

  const currentRoute = stack[stack.length - 1];

  // Tela de Inicialização / Carregamento do Banco
  if (dbState.isLoading) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />
        <View style={styles.splashContent}>
          <Text style={styles.splashLogo}>BRMM</Text>
          <Text style={styles.splashSubtitle}>BRModelo Mobile</Text>
          <ActivityIndicator
            size="large"
            color={THEME.colors.primaryLight}
            style={styles.splashSpinner}
          />
          <Text style={styles.splashText}>Inicializando banco SQLite local...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Tela de Erro na Conexão com o SQLite
  if (dbState.error) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />
        <View style={styles.splashContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.splashLogo}>Falha no SQLite</Text>
          <Text style={styles.errorMessageText}>{dbState.error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={startDatabase}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Navegação entre Telas do MVP
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background} />

      {currentRoute.name === 'Home' && (
        <HomeScreen
          onOpenProject={(project) =>
            handleNavigate('Project', { projectId: project.id })
          }
        />
      )}

      {currentRoute.name === 'Project' && (
        <ProjectScreen
          projectId={currentRoute.params.projectId}
          onBack={handleGoBack}
          onOpenEntity={(entity) =>
            handleNavigate('Entity', { entityId: entity.id })
          }
        />
      )}

      {currentRoute.name === 'Entity' && (
        <EntityScreen
          entityId={currentRoute.params.entityId}
          onBack={handleGoBack}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  splashContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  splashLogo: {
    fontSize: 34,
    fontWeight: '800',
    color: THEME.colors.primaryLight,
    letterSpacing: 2,
  },
  splashSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  splashSpinner: {
    marginVertical: 24,
  },
  splashText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorMessageText: {
    fontSize: 13,
    color: '#F87171',
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: THEME.borderRadius.md,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
