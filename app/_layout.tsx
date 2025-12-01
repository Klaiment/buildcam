import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import React from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { startUploadQueueProcessor } from "@/services/uploadQueue";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  React.useEffect(() => {
    startUploadQueueProcessor();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        <Stack.Screen name="project/[id]" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="project/[id]/edit" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="project/[id]/photo/[photoId]" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="project/[id]/gallery" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="project/[id]/rooms" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="project/[id]/room/[roomId]" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="sync-queue" options={{ headerShown: false, presentation: "card" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
