import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BRMM</Text>
        <Text style={styles.headerSubtitle}>BRModelo Mobile — MVP</Text>
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
          style={[styles.tabButton, activeTab === 'scope' && styles.tabButtonActive]}
          onPress={() => setActiveTab('scope')}
        >
          <Text style={[styles.tabText, activeTab === 'scope' && styles.tabTextActive]}>
            Escopo MVP
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
              <Text style={styles.cardTitle}>Bem-vindo ao BRMM</Text>
              <Text style={styles.cardParagraph}>
                O BRMM foi concebido para permitir a criação, organização e edição de modelos
                relacionais de banco de dados diretamente em smartphones e tablets.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Status do Projeto</Text>
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
                <Text style={styles.statusLabel}>Estrutura Base e Versionamento</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusBadgeWarning}>
                  <Text style={styles.statusBadgeText}>Próxima Etapa</Text>
                </View>
                <Text style={styles.statusLabel}>Persistência SQLite e Serviços</Text>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusBadgeInfo}>
                  <Text style={styles.statusBadgeText}>Próxima Etapa</Text>
                </View>
                <Text style={styles.statusLabel}>Telas de Modelagem de Entidades</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'scope' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Funcionalidades Essenciais do MVP</Text>
              <Text style={styles.featureItem}>• Criar novos projetos de modelagem</Text>
              <Text style={styles.featureItem}>• Listar projetos com carimbo de atualização</Text>
              <Text style={styles.featureItem}>• Abrir e continuar trabalhando em projetos</Text>
              <Text style={styles.featureItem}>• Criar e editar entidades por projeto</Text>
              <Text style={styles.featureItem}>• Adicionar atributos (tipos, PK e NOT NULL)</Text>
              <Text style={styles.featureItem}>• Estabelecer relacionamentos (1:1, 1:N, N:N)</Text>
              <Text style={styles.featureItem}>• Persistência local segura em SQLite</Text>
              <Text style={styles.featureItem}>• Excluir projetos mediante confirmação</Text>
            </View>

            <View style={styles.cardAlert}>
              <Text style={styles.cardAlertTitle}>Fora do Escopo Inicial</Text>
              <Text style={styles.cardAlertText}>
                Sem autenticação remota, sem backend/APIs externas, sem canvas gráfico livre
                e sem exportação SQL nesta versão inicial. O foco é estabilidade e dados locais.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'architecture' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Decisões de Engenharia</Text>
              <Text style={styles.techItem}>📱 <Text style={styles.bold}>UI:</Text> React Native + Expo</Text>
              <Text style={styles.techItem}>💾 <Text style={styles.bold}>Banco:</Text> SQLite Local (expo-sqlite)</Text>
              <Text style={styles.techItem}>💻 <Text style={styles.bold}>Linguagem:</Text> JavaScript (ES6+)</Text>
              <Text style={styles.techItem}>🧪 <Text style={styles.bold}>Testes:</Text> Jest (Unitários)</Text>
              <Text style={styles.techItem}>🛡️ <Text style={styles.bold}>DevSecOps:</Text> npm audit e Prepared Statements</Text>
              <Text style={styles.techItem}>🔄 <Text style={styles.bold}>CI/CD:</Text> GitHub Actions (planejado)</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Schema do SQLite</Text>
              <Text style={styles.schemaItem}>📁 <Text style={styles.bold}>projects:</Text> id, name, created_at, updated_at</Text>
              <Text style={styles.schemaItem}>🧱 <Text style={styles.bold}>entities:</Text> id, project_id, name</Text>
              <Text style={styles.schemaItem}>🏷️ <Text style={styles.bold}>attributes:</Text> id, entity_id, name, data_type, is_primary_key, is_required</Text>
              <Text style={styles.schemaItem}>🔗 <Text style={styles.bold}>relationships:</Text> id, project_id, source_entity_id, target_entity_id, relationship_type</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>BRMM • Documentação em docs/ • 100% Local</Text>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
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
    gap: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  cardParagraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#CBD5E1',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
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
  statusBadgeInfo: {
    backgroundColor: '#1E40AF',
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
  featureItem: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  cardAlert: {
    backgroundColor: '#3b1d1d',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  cardAlertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FCA5A5',
    marginBottom: 6,
  },
  cardAlertText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#FECACA',
  },
  techItem: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  schemaItem: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 22,
    marginTop: 4,
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
