import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

export const HomepageLogin = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
            <Image
                source={require("@/assets/images/buildcam.png")}
                style={{ width: 95, height: 95, marginBottom: 20 }}
            />
          <Text style={styles.brand}>BuildCam</Text>
          <Text style={styles.subtitle}>
            Documentez vos chantiers simplement
          </Text>
        </View>

        <View style={styles.ctaContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              router.push("/(tabs)/(login)/login");
            }}
          >
            <Text style={styles.primaryButtonText}>
              Se connecter / S&apos;inscrire
            </Text>
          </Pressable>
          <Text style={styles.helperText}>
            Aucune création de mot de passe nécessaire.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7fb",
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  brand: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
  ctaContainer: {
    width: "100%",
    gap: 14,
  },
  primaryButton: {
    backgroundColor: "#0f172a",
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
});
