import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
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

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const navigation = useRouter();
  const env = (typeof process !== "undefined" && process.env) || {};

  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());
  const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  const isGoogleConfigured = Boolean(webClientId);

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

  const handleSendMagicCode = () => {
    if (!isValidEmail) {
      return;
    }

    Alert.alert(
      "Code envoyé",
      "Vérifie ta boîte mail pour ouvrir le lien magique."
    );
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
                !isValidEmail && styles.primaryButtonDisabled,
              ]}
              disabled={!isValidEmail}
              onPress={handleSendMagicCode}
            >
              <Text style={styles.primaryButtonText}>
                Envoyer un code magique
              </Text>
            </Pressable>

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

{/*            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                💡 Vérifie ta boîte mail, le lien expire dans 30 secondes.
              </Text>
            </View>*/}
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
  tipCard: {
    marginTop: 18,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "rgba(23,66,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(23,66,255,0.25)",
  },
  tipText: {
    color: "#1742ff",
    fontSize: 14,
    lineHeight: 20,
  },
});
