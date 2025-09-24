import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { Card } from "@/data/types";
import { CardEditor } from "@/components/organisms/CardEditor";
import { saveCard } from "@/storage/cardStorage";

import { Button } from "@/components/atoms/Button";
import { Card as UICard } from "@/components/atoms/Card";

export default function CreateCardScreen() {
  const [card, setCard] = useState<Card>({
    id: Date.now().toString(),
    name: "",
    imageUri: "",
    collection: "",
    anime: "naruto",
    stats: { attack: 0, defense: 0, rarity: "common" },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!card.name.trim()) {
      Alert.alert("Erreur", "Le nom de la carte est requis");
      return;
    }

    if (card.stats.attack < 0 || card.stats.defense < 0) {
      Alert.alert("Erreur", "Les statistiques ne peuvent pas être négatives");
      return;
    }

    setIsLoading(true);

    try {
      await saveCard(card);
      Alert.alert(
          "Carte sauvegardée",
          `${card.name} a été ajoutée à votre collection`,
          [
            {
              text: "Voir ma collection",
              onPress: () => router.push("/(tabs)/")
            },
            {
              text: "Créer une autre",
              onPress: resetCard
            }
          ]
      );
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder la carte");
    } finally {
      setIsLoading(false);
    }
  };

  const resetCard = () => {
    setCard({
      id: Date.now().toString(),
      name: "",
      imageUri: "",
      collection: "",
      anime: "naruto",
      stats: { attack: 0, defense: 0, rarity: "common" },
    });
  };

  const handleGoBack = () => {
    if (card.name || card.stats.attack > 0 || card.stats.defense > 0) {
      Alert.alert(
          "Quitter",
          "Voulez-vous vraiment quitter ? Les modifications non sauvegardées seront perdues.",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Quitter", onPress: () => router.back() }
          ]
      );
    } else {
      router.back();
    }
  };

  const completionItems = [
    card.name.trim(),
    card.stats.attack > 0,
    card.stats.defense > 0,
    card.imageUri
  ];
  const completion = completionItems.filter(Boolean).length;
  const completionPercentage = Math.round((completion / completionItems.length) * 100);

  return (
      <View style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.header}>
          <Text style={styles.title}>Créer une carte</Text>
          <Text style={styles.subtitle}>Donnez vie à votre imagination</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                  style={[
                    styles.progressFill,
                    { width: `${completionPercentage}%` }
                  ]}
              />
            </View>
            <Text style={styles.progressText}>{completionPercentage}% complété</Text>
          </View>
        </View>

        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
          <UICard style={styles.editorCard}>
            <CardEditor card={card} onChange={setCard} />
          </UICard>

          <View style={styles.actionsContainer}>
            <Button
                label={isLoading ? "Sauvegarde..." : "Sauvegarder la carte"}
                onPress={handleSave}
            />

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleGoBack}
                  disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={resetCard}
                  disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>
          </View>

          <UICard variant="highlighted" style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Conseils de création</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Choisissez un nom unique et mémorable</Text>
              <Text style={styles.tipItem}>• Équilibrez attaque et défense selon la rareté</Text>
              <Text style={styles.tipItem}>• Une bonne image améliore l'impact visuel</Text>
              <Text style={styles.tipItem}>• Testez différents templates d'anime</Text>
            </View>
          </UICard>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c2b',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(40, 40, 60, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5c',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#e0b422',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#b0b0c0',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(224, 180, 34, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e0b422',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#b0b0c0',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  editorCard: {
    marginBottom: 24,
    padding: 20,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a5c',
  },
  secondaryButtonText: {
    color: '#b0b0c0',
    fontSize: 16,
    fontWeight: '500',
  },
  tipsCard: {
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0b422',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    color: '#b0b0c0',
    fontSize: 14,
    lineHeight: 20,
  },
});