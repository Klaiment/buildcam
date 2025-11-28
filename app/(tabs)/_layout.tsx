import { Tabs } from "expo-router";
import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { auth } from "@/firebase/config";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = React.useState<User | null>(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          {
            display: user ? "flex" : "none",
          },
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chantiers",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="folder.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(login)/index"
        options={{
          title: "Compte",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
          tabBarButton: user ? () => null : undefined,
          tabBarItemStyle: user ? { display: "none" } : undefined,
        }}
      />
    </Tabs>
  );
}
