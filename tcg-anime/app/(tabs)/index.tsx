import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Card } from '@/components/atoms/Card';
import { ActionCard } from '@/components/molecules/ActionCard';

export default function HomeScreen() {
  const handleCreateCard = () => {
    router.push('/(tabs)/create-card');
  };

  const handleViewCollection = () => {
    console.log('Collection');
  };

  const handleBattle = () => {
    console.log('Combat');
  };

  const handleStats = () => {
    console.log('Stats');
  };

  return (
      <View style={styles.container}>
        <StatusBar style="light" />

        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Bienvenue</Text>
            <Text style={styles.userName}>Duelliste</Text>
            <Text style={styles.subtitle}>Votre collection TCG Anime</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>

            <View style={styles.actionsRow}>
              <ActionCard
                  icon="✨"
                  title="Créer une carte"
                  subtitle="Nouvelle création"
                  onPress={handleCreateCard}
                  highlighted={true}
              />

              <ActionCard
                  icon="📚"
                  title="Ma collection"
                  subtitle="0 cartes"
                  onPress={handleViewCollection}
              />
            </View>

            <View style={styles.actionsRow}>
              <ActionCard
                  icon="⚔️"
                  title="Combat"
                  subtitle="Nouveau duel"
                  onPress={handleBattle}
              />

              <ActionCard
                  icon="📊"
                  title="Statistiques"
                  subtitle="Mes performances"
                  onPress={handleStats}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vos statistiques</Text>

            <Card>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Cartes créées</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Duels gagnés</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>1</Text>
                  <Text style={styles.statLabel}>Niveau</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>XP</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Activité récente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activité récente</Text>

            <Card style={styles.activityItem}>
              <View style={styles.activityContent}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>🎮</Text>
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>Bienvenue dans TCG Anime</Text>
                  <Text style={styles.activitySubtitle}>Commencez par créer votre première carte</Text>
                  <Text style={styles.activityTime}>Maintenant</Text>
                </View>
              </View>
            </Card>

            <Card onPress={handleCreateCard} style={styles.activityItem}>
              <View style={styles.activityContent}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>✨</Text>
                </View>
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>Créer votre première carte</Text>
                  <Text style={styles.activitySubtitle}>Débutez votre collection</Text>
                  <Text style={styles.activityAction}>Commencer →</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Conseil du jour */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conseil du jour</Text>

            <Card variant="highlighted" style={styles.tipCard}>
              <View style={styles.tipContent}>
                <Text style={styles.tipIcon}>💡</Text>
                <View style={styles.tipText}>
                  <Text style={styles.tipTitle}>Astuce de création</Text>
                  <Text style={styles.tipDescription}>
                    Commencez par des cartes simples avec des statistiques équilibrées.
                    Vous pourrez toujours créer des cartes plus puissantes plus tard !
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c2b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(40, 40, 60, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5c',
  },
  welcomeText: {
    fontSize: 16,
    color: '#b0b0c0',
    fontWeight: '400',
  },
  userName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#e0b422',
    marginVertical: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8a8a9a',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0b422',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e0b422',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#b0b0c0',
    textAlign: 'center',
  },
  activityItem: {
    marginBottom: 12,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(224, 180, 34, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityIconText: {
    fontSize: 20,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#b0b0c0',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#8a8a9a',
  },
  activityAction: {
    fontSize: 12,
    color: '#e0b422',
    fontWeight: '500',
  },
  tipCard: {
    padding: 20,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0b422',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#b0b0c0',
    lineHeight: 20,
  },
});