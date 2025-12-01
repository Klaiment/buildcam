import { Tabs } from "expo-router";
import React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "@/firebase/config";

export default function TabLayout() {
  const [user, setUser] = React.useState<User | null>(null);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Chantiers" }} />
    </Tabs>
  );
}
