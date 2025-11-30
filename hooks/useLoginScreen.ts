import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, router } from "expo-router";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { Alert } from "react-native";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
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
const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const isGoogleConfigured = Boolean(webClientId);

export const useLoginScreen = () => {
  const navigation = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [sendingLink, setSendingLink] = React.useState(false);
  const [verifyingLink, setVerifyingLink] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [loadingRemember, setLoadingRemember] = React.useState(true);
  const [linkSentEmail, setLinkSentEmail] = React.useState<string | null>(null);

  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());

  const actionCodeSettings = React.useMemo(() => {
    if (!firebaseEmailLinkUrl) return null;
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
    if (!isGoogleConfigured) return;
    GoogleSignin.configure({
      webClientId,
      scopes: ["profile", "email"],
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });
  }, []);

  const handleIncomingLink = React.useCallback(
    async (url?: string | null) => {
      if (!url || !isSignInWithEmailLink(auth, url)) return;
      try {
        setVerifyingLink(true);
        const pendingEmail =
          (await AsyncStorage.getItem("pendingEmail")) || email.trim();
        if (!pendingEmail) {
          Alert.alert("Email requis", "Renseigne ton email puis reclique sur le lien.");
          return;
        }
        await signInWithEmailLink(auth, pendingEmail, url);
        await AsyncStorage.removeItem("pendingEmail");
        Alert.alert("Connexion réussie", "Redirection vers tes projets.");
        router.replace("/(tabs)");
      } catch (error: any) {
        const message =
          error?.message || "Impossible de finaliser la connexion par lien magique.";
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

  React.useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const storedEmail = await SecureStore.getItemAsync("rememberedEmail");
        if (storedEmail) {
          setEmail(storedEmail);
          setRememberMe(true);
        }
      } catch {
      } finally {
        setLoadingRemember(false);
      }
    };
    void loadRememberedEmail();
  }, []);

  const handleGoBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.back();
      return;
    }
    router.replace("/(tabs)/(login)");
  }, [navigation]);

  const handleGoProjects = React.useCallback(() => {
    router.replace("/(tabs)");
  }, []);

  const handleSendMagicCode = React.useCallback(async () => {
    if (!isValidEmail || sendingLink || verifyingLink) return;
    if (!actionCodeSettings?.url) {
      Alert.alert("Configuration manquante", "L'URL de redirection Firebase n'est pas définie.");
      return;
    }
    try {
      setSendingLink(true);
      const normalizedEmail = email.trim();
      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
      await AsyncStorage.setItem("pendingEmail", normalizedEmail);
      setLinkSentEmail(normalizedEmail);
      if (rememberMe) {
        await SecureStore.setItemAsync("rememberedEmail", normalizedEmail);
      } else {
        await SecureStore.deleteItemAsync("rememberedEmail");
      }
      Alert.alert(
        "Lien envoyé",
        "Vérifie tes emails. Le lien arrive en ~30s et s'ouvre sur cet appareil."
      );
    } catch (error: any) {
      const message = error?.message || "Impossible d'envoyer le lien de connexion.";
      Alert.alert("Envoi impossible", message);
    } finally {
      setSendingLink(false);
    }
  }, [actionCodeSettings, email, isValidEmail, rememberMe, sendingLink, verifyingLink]);

  const handleGoogleSignIn = React.useCallback(async () => {
    if (!isGoogleConfigured || googleLoading || !webClientId) return;
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken } = await GoogleSignin.signIn();
      if (!idToken) {
        Alert.alert("Erreur Google", "Aucun token reçu.");
        return;
      }
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      Alert.alert("Connexion réussie", "Redirection vers tes projets.");
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) return;
      const message = error?.message || "Impossible de procéder à la connexion Google.";
      Alert.alert("Erreur Google", message);
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLoading]);

  const handlePasswordSignIn = React.useCallback(async () => {
    if (!isValidEmail || password.length < 6 || authLoading) return;
    try {
      setAuthLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (rememberMe) {
        await SecureStore.setItemAsync("rememberedEmail", email.trim());
      } else {
        await SecureStore.deleteItemAsync("rememberedEmail");
      }
      Alert.alert("Connexion réussie", "Redirection vers tes projets.");
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error?.message || "Impossible de se connecter avec cet email/mot de passe.";
      Alert.alert("Connexion impossible", message);
    } finally {
      setAuthLoading(false);
    }
  }, [authLoading, email, isValidEmail, password, rememberMe]);

  const handlePasswordSignUp = React.useCallback(async () => {
    if (!isValidEmail || password.length < 6 || authLoading) return;
    try {
      setAuthLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (rememberMe) {
        await SecureStore.setItemAsync("rememberedEmail", email.trim());
      } else {
        await SecureStore.deleteItemAsync("rememberedEmail");
      }
      Alert.alert("Compte créé", "Connexion en cours sur tes projets.");
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error?.message || "Impossible de créer le compte pour le moment.";
      Alert.alert("Création impossible", message);
    } finally {
      setAuthLoading(false);
    }
  }, [authLoading, email, isValidEmail, password, rememberMe]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    sendingLink,
    verifyingLink,
    googleLoading,
    authLoading,
    checkingAuth,
    loadingRemember,
    currentUser,
    rememberMe,
    setRememberMe,
    toggleRemember: () => setRememberMe((prev) => !prev),
    isGoogleConfigured,
    isValidEmail,
    linkSentEmail,
    handleGoBack,
    handleGoProjects,
    handleSendMagicCode,
    handleGoogleSignIn,
    handlePasswordSignIn,
    handlePasswordSignUp,
  };
};
