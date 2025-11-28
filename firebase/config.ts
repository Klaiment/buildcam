import { initializeApp, getApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const env = (typeof process !== "undefined" && process.env) || {};

const firebaseConfig = {
  apiKey:
    env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyD6tFQ01jHcHndUq9TL_dSbc0R2vRaiQzg",
  authDomain:
    env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "buildcam-4b2d1.firebaseapp.com",
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "buildcam-4b2d1",
  storageBucket:
    env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "buildcam-4b2d1.firebasestorage.app",
  messagingSenderId:
    env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "387100450286",
  appId:
    env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:387100450286:android:f726e65924f786b4c8c2ff",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth =
  (getApps().length && getAuth(app)) ||
  initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

export { app, auth };
