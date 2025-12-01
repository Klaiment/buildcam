import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./styles";

type Props = {
  email: string;
  password: string;
  rememberMe: boolean;
  isValidEmail: boolean;
  isGoogleConfigured: boolean;
  sendingLink: boolean;
  verifyingLink: boolean;
  googleLoading: boolean;
  authLoading: boolean;
  linkSentEmail: string | null;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onToggleRemember: () => void;
  onSendMagic: () => void;
  onGoogleSignIn: () => void;
  onPasswordSignIn: () => void;
  onPasswordSignUp: () => void;
  onBack: () => void;
};

export const LoginView = ({
  email,
  password,
  rememberMe,
  isValidEmail,
  isGoogleConfigured,
  sendingLink,
  verifyingLink,
  googleLoading,
  authLoading,
  linkSentEmail,
  onEmailChange,
  onPasswordChange,
  onToggleRemember,
  onSendMagic,
  onGoogleSignIn,
  onPasswordSignIn,
  onPasswordSignUp,
  onBack,
}: Props) => {
  const canSendMagic = isValidEmail && !sendingLink && !verifyingLink;
  const canPasswordSubmit = isValidEmail && password.length >= 6 && !authLoading;
  const canGoogle = isGoogleConfigured && !googleLoading;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Pressable onPress={onBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={22} color="#0f172a" />
              </Pressable>
              <Text style={styles.headerTitle}>Connexion / Inscription</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Adresse email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                <TextInput
                  value={email}
                  onChangeText={onEmailChange}
                  placeholder="votre@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={styles.input}
                />
              </View>
            </View>

            <Pressable
              style={[
                styles.primaryButton,
                !canSendMagic && styles.primaryButtonDisabled,
              ]}
              disabled={!canSendMagic}
              onPress={onSendMagic}
            >
              <Text style={styles.primaryButtonText}>
                {sendingLink ? "Envoi en cours..." : "Envoyer un lien magique"}
              </Text>
            </Pressable>

            <Text style={styles.helperText}>
              Le lien arrive sous ~30s. Ouvre-le sur cet appareil pour entrer.
            </Text>
            {linkSentEmail ? (
              <View style={{ marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: "#eef2ff", borderWidth: 1, borderColor: "#e0e7ff" }}>
                <Text style={{ color: "#1e3a8a", fontWeight: "600" }}>
                  Lien envoyé à {linkSentEmail}
                </Text>
                <Text style={styles.helperSmall}>
                  Vérifie ta boîte mail, le lien expire rapidement.
                </Text>
              </View>
            ) : null}
            {verifyingLink ? (
              <View style={{ marginTop: 8, padding: 10, borderRadius: 10, backgroundColor: "#ecfdf3", borderWidth: 1, borderColor: "#bbf7d0" }}>
                <Text style={{ color: "#15803d", fontWeight: "600" }}>
                  Validation du lien...
                </Text>
              </View>
            ) : null}

            <Pressable style={styles.rememberRow} onPress={onToggleRemember}>
              <View
                style={[
                  styles.rememberCheckbox,
                  rememberMe && styles.rememberCheckboxChecked,
                ]}
              >
                {rememberMe && <Ionicons name="checkmark" size={14} color="#ffffff" />}
              </View>
              <Text style={styles.rememberText}>Se souvenir de moi (sécurisé)</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={[styles.googleButton, !canGoogle && styles.googleButtonDisabled]}
              disabled={!canGoogle}
              onPress={onGoogleSignIn}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color="#0f172a"
                style={{ marginRight: 12 }}
              />
              <Text style={styles.googleButtonText}>
                {googleLoading ? "Connexion en cours..." : "Continuer avec Google"}
              </Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou email / mot de passe</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe (min. 6 caractères)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                <TextInput
                  value={password}
                  onChangeText={onPasswordChange}
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <Pressable
                style={[
                  styles.primaryButton,
                  !canPasswordSubmit && styles.primaryButtonDisabled,
                ]}
                disabled={!canPasswordSubmit}
                onPress={onPasswordSignIn}
              >
                <Text style={styles.primaryButtonText}>
                  {authLoading ? "Connexion..." : "Se connecter"}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.secondaryButton,
                  !canPasswordSubmit && styles.secondaryButtonDisabled,
                ]}
                disabled={!canPasswordSubmit}
                onPress={onPasswordSignUp}
              >
                <Text style={styles.secondaryButtonText}>
                  {authLoading ? "Création..." : "Créer un compte"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
