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

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string) => {
    // Username : lettres, chiffres, underscore, 3-20 caractères
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleRegister = async () => {
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setDisplayNameError("");

    let hasError = false;

    if (!username) {
      setUsernameError("Nom d'utilisateur requis");
      hasError = true;
    } else if (!validateUsername(username)) {
      setUsernameError("3-20 caractères, lettres, chiffres et _ uniquement");
      hasError = true;
    }

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

    if (!confirmPassword) {
      setConfirmPasswordError("Confirmation requise");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
      hasError = true;
    }

    if (!displayName) {
      setDisplayNameError("Nom d'affichage requis");
      hasError = true;
    } else if (displayName.length < 2) {
      setDisplayNameError("Minimum 2 caractères");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://172.233.255.18:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          displayName: displayName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
            "Inscription réussie",
            "Votre compte a été créé avec succès",
            [
              {
                text: "Se connecter",
                onPress: () => router.replace("/login")
              }
            ]
        );
      } else {
        const errorMessage = data.message || "Erreur lors de l'inscription";
        Alert.alert("Erreur d'inscription", errorMessage);

        if (data.field === 'username') {
          setUsernameError("Ce nom d'utilisateur est déjà pris");
        }
        if (data.field === 'email') {
          setEmailError("Cet email est déjà utilisé");
        }
      }

    } catch (error) {
      console.error("Erreur d'inscription:", error);
      Alert.alert(
          "Erreur de connexion",
          "Impossible de se connecter au serveur"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
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
            <View style={styles.registerContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Créer un compte</Text>
                <Text style={styles.subtitle}>Rejoignez la communauté TCG Anime</Text>
              </View>

              <View style={styles.formContainer}>
                <Input
                    label="Nom d'utilisateur"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Votre nom d'utilisateur"
                    error={usernameError}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                />

                <Input
                    label="Nom d'affichage"
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Comment vous appeler"
                    error={displayNameError}
                    editable={!isLoading}
                />

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

                <Input
                    label="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Répétez votre mot de passe"
                    secureTextEntry
                    error={confirmPasswordError}
                    autoCapitalize="none"
                    editable={!isLoading}
                />

                <Button
                    label={isLoading ? "Inscription..." : "Créer le compte"}
                    onPress={handleRegister}
                />
              </View>

              <View style={styles.footer}>
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>Déjà un compte ? </Text>
                  <TouchableOpacity
                      onPress={handleGoToLogin}
                      disabled={isLoading}
                  >
                    <Text style={styles.loginLink}>Se connecter</Text>
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
  registerContainer: {
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
    gap: 4,
  },
  footer: {
    alignItems: "center",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    color: "#8a8a9a",
    fontSize: 14,
  },
  loginLink: {
    color: "#e0b422",
    fontSize: 14,
    fontWeight: "600",
  },
});