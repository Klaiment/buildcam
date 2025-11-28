import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";

import { auth } from "@/firebase/config";

const env = (typeof process !== "undefined" && process.env) || {};
const firebaseAuthDomain = env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseEmailLinkUrl =
  env.EXPO_PUBLIC_FIREBASE_EMAIL_LINK_URL ||
  (firebaseAuthDomain ? `https://${firebaseAuthDomain}/auth` : undefined);
const firebaseDynamicLinkDomain = env.EXPO_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN;

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [sendingLink, setSendingLink] = React.useState(false);
  const [verifyingLink, setVerifyingLink] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [authLoading, setAuthLoading] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const navigation = useRouter();

  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());
  const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  const isGoogleConfigured = Boolean(webClientId);
  const actionCodeSettings = React.useMemo(() => {
    if (!firebaseEmailLinkUrl) {
      return null;
    }

    return {
      url: firebaseEmailLinkUrl,
      handleCodeInApp: true,
      android: {
        packageName: "com.klaiment.buildcam",
        installApp: false,
      },
      iOS: {
        bundleId: "com.klaiment.buildcam",
      },
      ...(firebaseDynamicLinkDomain
        ? { dynamicLinkDomain: firebaseDynamicLinkDomain }
        : {}),
    };
  }, []);

  React.useEffect(() => {
    if (!isGoogleConfigured) {
      return;
    }

    GoogleSignin.configure({
      webClientId,
      scopes: ["profile", "email"],
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });
  }, [isGoogleConfigured, webClientId]);

  const handleIncomingLink = React.useCallback(
    async (url?: string | null) => {
      if (!url || !isSignInWithEmailLink(auth, url)) {
        return;
      }

      try {
        setVerifyingLink(true);
        const pendingEmail =
          (await AsyncStorage.getItem("pendingEmail")) || email.trim();

        if (!pendingEmail) {
          Alert.alert(
            "Email requis",
            "Renseigne ton email puis reclique sur le lien."
          );
          return;
        }

        await signInWithEmailLink(auth, pendingEmail, url);
        await AsyncStorage.removeItem("pendingEmail");
        Alert.alert("Connexion réussie", "Redirection vers tes projets.");
        router.replace("/(tabs)");
      } catch (error: any) {
        const message =
          error?.message ||
          "Impossible de finaliser la connexion par lien magique.";
        Alert.alert("Connexion impossible", message);
      } finally {
        setVerifyingLink(false);
      }
    },
    [email]
  );

  React.useEffect(() => {
    Linking.getInitialURL().then(handleIncomingLink).catch(() => {});
    const sub = Linking.addEventListener("url", ({ url }) =>
      handleIncomingLink(url)
    );
    return () => sub.remove();
  }, [handleIncomingLink]);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  if (checkingAuth) {
    return null;
  }

  if (currentUser) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={[styles.card, { margin: 20, alignSelf: "stretch" }]}>
          <View style={styles.header}>
            <Pressable onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color="#0f172a" />
            </Pressable>
            <Text style={styles.headerTitle}>Déjà connecté</Text>
          </View>
          <Text style={styles.helperText}>
            Connecté en tant que {currentUser.email || "utilisateur"}. Tu peux
            retourner à tes chantiers.
          </Text>
          <Pressable
            style={[styles.primaryButton, { marginTop: 20 }]}
            onPress={() => router.replace("/(tabs)/index")}
          >
            <Text style={styles.primaryButtonText}>Aller aux chantiers</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleGoogleSignIn = async () => {
    if (!isGoogleConfigured || googleLoading || !webClientId) {
      return;
    }

    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken } = await GoogleSignin.signIn();

      Alert.alert(
        "Connexion Google réussie",
        idToken
          ? "Token reçu, prêt à lier le compte côté serveur."
          : "Connecté, aucun token retourné."
      );
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      const message =
        error?.message || "Impossible de procéder à la connexion Google.";
      Alert.alert("Erreur Google", message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendMagicCode = async () => {
    if (!isValidEmail || sendingLink || verifyingLink) {
      return;
    }

    if (!actionCodeSettings?.url) {
      Alert.alert(
        "Configuration manquante",
        "L'URL de redirection Firebase n'est pas définie."
      );
      return;
    }

    try {
      setSendingLink(true);
      const normalizedEmail = email.trim();
      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
      await AsyncStorage.setItem("pendingEmail", normalizedEmail);
      Alert.alert(
        "Lien envoyé",
        "Vérifie tes emails. Le lien arrive en ~30s et s'ouvre sur cet appareil."
      );
    } catch (error: any) {
      const message =
        error?.message || "Impossible d'envoyer le lien de connexion.";
      Alert.alert("Envoi impossible", message);
    } finally {
      setSendingLink(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.back();
      return;
    }

    router.replace("/(tabs)/(login)");
  };

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
              <Pressable onPress={handleGoBack} style={styles.backButton}>
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
                  onChangeText={setEmail}
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
                (!isValidEmail || sendingLink) &&
                  styles.primaryButtonDisabled,
              ]}
              disabled={!isValidEmail || sendingLink}
              onPress={handleSendMagicCode}
            >
              <Text style={styles.primaryButtonText}>
                {sendingLink ? "Envoi en cours..." : "Envoyer un lien magique"}
              </Text>
            </Pressable>

            <Text style={styles.helperText}>
              Le lien arrive sous ~30s. Ouvre-le sur cet appareil pour entrer.
            </Text>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={[
                styles.googleButton,
                (!isGoogleConfigured || googleLoading) &&
                  styles.googleButtonDisabled,
              ]}
              disabled={!isGoogleConfigured || googleLoading}
              onPress={handleGoogleSignIn}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color="#0f172a"
                style={{ marginRight: 12 }}
              />
              <Text style={styles.googleButtonText}>
                {googleLoading
                  ? "Connexion en cours..."
                  : "Continuer avec Google"}
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
                  onChangeText={setPassword}
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
                  (!isValidEmail || password.length < 6 || authLoading) &&
                    styles.primaryButtonDisabled,
                ]}
                disabled={!isValidEmail || password.length < 6 || authLoading}
                onPress={async () => {
                  if (!isValidEmail || password.length < 6) return;
                  try {
                    setAuthLoading(true);
                    await signInWithEmailAndPassword(
                      auth,
                      email.trim(),
                      password
                    );
                    Alert.alert(
                      "Connexion réussie",
                      "Redirection vers tes projets."
                    );
                    router.replace("/(tabs)");
                  } catch (error: any) {
                    const message =
                      error?.message ||
                      "Impossible de se connecter avec cet email/mot de passe.";
                    Alert.alert("Connexion impossible", message);
                  } finally {
                    setAuthLoading(false);
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {authLoading ? "Connexion..." : "Se connecter"}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.secondaryButton,
                  (!isValidEmail || password.length < 6 || authLoading) &&
                    styles.secondaryButtonDisabled,
                ]}
                disabled={!isValidEmail || password.length < 6 || authLoading}
                onPress={async () => {
                  if (!isValidEmail || password.length < 6) return;
                  try {
                    setAuthLoading(true);
                    await createUserWithEmailAndPassword(
                      auth,
                      email.trim(),
                      password
                    );
                    Alert.alert(
                      "Compte créé",
                      "Connexion en cours sur tes projets."
                    );
                    router.replace("/(tabs)");
                  } catch (error: any) {
                    const message =
                      error?.message ||
                      "Impossible de créer le compte pour le moment.";
                    Alert.alert("Création impossible", message);
                  } finally {
                    setAuthLoading(false);
                  }
                }}
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
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7fb",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eef1f6",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f1f2f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 10,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111827",
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#0f172a",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.35,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#9ca3af",
    fontSize: 13,
  },
  googleButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonDisabled: {
    opacity: 0.4,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonDisabled: {
    opacity: 0.4,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
