import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const isLoggedIn = false;

      if (isLoggedIn) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification auth:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
        <View style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.loadingContainer}>
            <Text style={styles.title}>⚡ TCG Anime ⚡</Text>
            <Text style={styles.subtitle}>Chargement...</Text>
            <View style={styles.loadingBar}>
              <View style={styles.loadingProgress} />
            </View>
          </View>
        </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c2b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e0b422',
    textAlign: 'center',
    textShadowColor: 'rgba(224, 180, 34, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
    marginBottom: 30,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(224, 180, 34, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0b422',
    borderRadius: 2,
    opacity: 0.8,
  },
});