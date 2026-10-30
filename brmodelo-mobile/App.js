import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { initDatabase } from './src/database/index.js';
import { getProjects, createProject } from './src/database/repositories/projectRepository.js';
import { formatDisplayDate } from './src/utils/date.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dbStatus, setDbStatus] = useState({ loading: true, success: false, error: null, version: null });
  const [projectsList, setProjectsList] = useState([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    async function setupDb() {
      try {
        const { migrationResult } = await initDatabase();
        setDbStatus({
          loading: false,
          success: true,
          error: null,
          version: migrationResult.currentVersion || 1,
        });
        await loadProjects();
      } catch (err) {
        setDbStatus({
          loading: false,
          success: false,
          error: err.message,
          version: null,
        });
      }
    }
    setupDb();
  }, []);

  async function loadProjects() {
    try {
      const projects = await getProjects();
      setProjectsList(projects);
    } catch (err) {
      console.warn('Erro ao carregar projetos:', err.message);
    }
  }

  async function handleQuickCreateProject() {
    if (isCreatingProject) return;
    setIsCreatingProject(true);
    try {
      const count = projectsList.length + 1;
      await createProject({ name: `Projeto Exemplo ${count}` });
      await loadProjects();
    } catch (err) {
      alert(`Erro ao criar projeto: ${err.message}`);
    } finally {
      setIsCreatingProject(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BRMM</Text>
        <Text style={styles.headerSubtitle}>BRModelo Mobile — Camada SQLite Ativa</Text>
      </View>

      {/* Database Status Banner */}
      <View style={styles.statusBanner}>
        {dbStatus.loading ? (
          <View style={styles.bannerRow}>
            <ActivityIndicator size="small" color="#38BDF8" />
            <Text style={styles.bannerText}>Inicializando SQLite e migrações...</Text>
          </View>
        ) : dbStatus.success ? (
          <View style={styles.bannerRow}>
            <View style={styles.indicatorDotSuccess} />
            <Text style={styles.bannerSuccessText}>
              SQLite Conectado • Schema v{dbStatus.version} • Foreign Keys Ativas
            </Text>
          </View>
        ) : (
          <View style={styles.bannerRow}>
            <View style={styles.indicatorDotError} />
            <Text style={styles.bannerErrorText}>Erro no SQLite: {dbStatus.error}</Text>
          </View>
        )}
      </View>

      {/* Navigation Pills */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Visão Geral
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'database' && styles.tabButtonActive]}
          onPress={() => setActiveTab('database')}
        >
          <Text style={[styles.tabText, activeTab === 'database' && styles.tabTextActive]}>
            Persistência ({projectsList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'architecture' && styles.tabButtonActive]}
          onPress={() => setActiveTab('architecture')}
        >
          <Text style={[styles.tabText, activeTab === 'architecture' && styles.tabTextActive]}>
            Arquitetura
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'overview' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Camada de Persistência Concluída</Text>
              <Text style={styles.cardParagraph}>
                O banco local SQLite foi configurado com versionamento por migrações, chaves estrangeiras ativas e integridade referencial em cascata para projetos, entidades, atributos e relacionamentos.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Status do Desenvolvimento</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusBadgeSuccess}>
                  <Text style={styles.statusBadgeText}>Concluído</Text>
                </View>
                <Text style={styles.statusLabel}>Documentação de Engenharia (docs/)</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusBadgeSuccess}>
                  <Text style={styles.statusBadgeText}>Concluído</Text>
                </View>
                <Text style={styles.statusLabel}>Camada de Persistência SQLite & Migrations</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusBadgeSuccess}>
                  <Text style={styles.statusBadgeText}>Concluído</Text>
                </View>
                <Text style={styles.statusLabel}>Repositórios Parametrizados (CRUD)</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusBadgeWarning}>
                  <Text style={styles.statusBadgeText}>Próxima Etapa</Text>
                </View>
                <Text style={styles.statusLabel}>Interface Completa de Telas (HomeScreen/Project)</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'database' && (
          <View>
            <View style={styles.card}>
              <View style={styles.cardHeaderAction}>
                <Text style={styles.cardTitle}>Projetos no SQLite Local</Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleQuickCreateProject}
                  disabled={isCreatingProject}
                >
                  <Text style={styles.actionButtonText}>+ Novo Projeto</Text>
                </TouchableOpacity>
              </View>

              {projectsList.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum projeto persistido ainda. Toque em '+ Novo Projeto' acima para testar a gravação no SQLite!
                </Text>
              ) : (
                projectsList.map((p) => (
                  <View key={p.id} style={styles.projectItem}>
                    <View>
                      <Text style={styles.projectName}>{p.name}</Text>
                      <Text style={styles.projectDate}>
                        Atualizado em: {formatDisplayDate(p.updatedAt)}
                      </Text>
                    </View>
                    <View style={styles.badgeId}>
                      <Text style={styles.badgeIdText}>{p.id.substring(0, 8)}...</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tabelas e Integridade</Text>
              <Text style={styles.techItem}>📁 <Text style={styles.bold}>projects:</Text> CASCADE ativo</Text>
              <Text style={styles.techItem}>🧱 <Text style={styles.bold}>entities:</Text> UNIQUE(project_id, name) e UNIQUE(id, project_id)</Text>
              <Text style={styles.techItem}>🏷️ <Text style={styles.bold}>attributes:</Text> UNIQUE(entity_id, name) e CHECK(types)</Text>
              <Text style={styles.techItem}>🔗 <Text style={styles.bold}>relationships:</Text> FKs compostas e CHECK(no reflexivo)</Text>
            </View>
          </View>
        )}

        {activeTab === 'architecture' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Estrutura da Camada de Persistência</Text>
              <Text style={styles.schemaItem}>📂 <Text style={styles.bold}>database/index.js:</Text> Conexão SQLite e transações</Text>
              <Text style={styles.schemaItem}>📂 <Text style={styles.bold}>database/migrations/:</Text> Controle versionado (001_initial_schema)</Text>
              <Text style={styles.schemaItem}>📂 <Text style={styles.bold}>database/repositories/:</Text> Operações CRUD parametrizadas</Text>
              <Text style={styles.schemaItem}>📂 <Text style={styles.bold}>models/:</Text> Entidades de domínio tipadas</Text>
              <Text style={styles.schemaItem}>📂 <Text style={styles.bold}>utils/validation.js:</Text> Validações preventivas de domínio</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Garantias de Segurança (DevSecOps)</Text>
              <Text style={styles.techItem}>🛡️ Consultas 100% parametrizadas (anti SQL Injection)</Text>
              <Text style={styles.techItem}>🛡️ PRAGMA foreign_keys = ON ativado explicitamente</Text>
              <Text style={styles.techItem}>🛡️ Transações atômicas com ROLLBACK automático em erros</Text>
              <Text style={styles.techItem}>🛡️ Execução 100% offline e privada no dispositivo</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>BRMM • SQLite Persistência Ativa • 100% Local</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBanner: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorDotSuccess: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  indicatorDotError: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  bannerText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  bannerSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34D399',
  },
  bannerErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F87171',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    gap: 8,
  },
  tabButton: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  tabButtonActive: {
    backgroundColor: '#0284C7',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentContainer: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeaderAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardParagraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CBD5E1',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 6,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  projectDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badgeId: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeIdText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 10,
  },
  statusBadgeSuccess: {
    backgroundColor: '#065F46',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeWarning: {
    backgroundColor: '#92400E',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 13,
    color: '#E2E8F0',
    flexShrink: 1,
  },
  techItem: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 22,
    marginTop: 4,
  },
  schemaItem: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 22,
    marginTop: 6,
  },
  bold: {
    fontWeight: '700',
    color: '#38BDF8',
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
});
