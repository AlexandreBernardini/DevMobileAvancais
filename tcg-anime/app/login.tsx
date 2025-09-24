import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email) {
      setEmailError("Email requis");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Email invalide");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Mot de passe requis");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Minimum 6 caractères");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("Tentative de connexion:", { email, password });

      Alert.alert(
          "Connexion réussie",
          "Bienvenue dans TCG Anime",
          [
            {
              text: "Continuer",
              onPress: () => router.replace("/(tabs)")
            }
          ]
      );

    } catch (error) {
      console.error("Erreur de connexion:", error);
      Alert.alert(
          "Erreur de connexion",
          "Email ou mot de passe incorrect",
          [{ text: "Réessayer" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
        "Mot de passe oublié",
        "Un lien de réinitialisation sera bientôt disponible",
        [{ text: "OK" }]
    );
  };

  const handleSignUp = () => {
    router.push("/register");
  };

  const handleGuestMode = () => {
    Alert.alert(
        "Mode découverte",
        "Accéder à l'app en mode limité ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Continuer",
            onPress: () => {
              console.log("Mode invité activé");
              router.replace("/(tabs)");
            }
          }
        ]
    );
  };

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar style="light" />

        <View style={styles.background}>
          <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
          >
            <View style={styles.loginContainer}>
              {/* Header simple */}
              <View style={styles.header}>
                <Text style={styles.title}>TCG Anime</Text>
                <Text style={styles.subtitle}>Connexion</Text>
              </View>

              {/* Formulaire de connexion */}
              <View style={styles.formContainer}>
                <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Votre email"
                    keyboardType="email-address"
                    error={emailError}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                />

                <Input
                    label="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Votre mot de passe"
                    secureTextEntry
                    error={passwordError}
                    autoCapitalize="none"
                    editable={!isLoading}
                />

                <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    onPress={handleForgotPassword}
                    disabled={isLoading}
                >
                  <Text style={styles.forgotPasswordText}>
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>

                <Button
                    label={isLoading ? "Connexion..." : "Se connecter"}
                    onPress={handleLogin}
                />
              </View>

              {/* Options alternatives */}
              <View style={styles.alternativeOptions}>
                <TouchableOpacity
                    style={styles.guestButton}
                    onPress={handleGuestMode}
                    disabled={isLoading}
                >
                  <Text style={styles.guestButtonText}>
                    Mode découverte
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer avec lien inscription */}
              <View style={styles.footer}>
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Pas encore de compte ? </Text>
                  <TouchableOpacity
                      onPress={handleSignUp}
                      disabled={isLoading}
                  >
                    <Text style={styles.signUpLink}>Créer un compte</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "#1c1c2b",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  loginContainer: {
    backgroundColor: "rgba(40, 40, 60, 0.9)",
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#3a3a5c",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#e0b422",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#b0b0c0",
    textAlign: "center",
    fontWeight: "400",
  },
  formContainer: {
    marginBottom: 24,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#e0b422",
    fontSize: 14,
    fontWeight: "500",
  },
  alternativeOptions: {
    marginBottom: 24,
  },
  guestButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#5a5a7a",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  guestButtonText: {
    color: "#b0b0c0",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signUpText: {
    color: "#8a8a9a",
    fontSize: 14,
  },
  signUpLink: {
    color: "#e0b422",
    fontSize: 14,
    fontWeight: "600",
  },
});