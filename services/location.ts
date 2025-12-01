import * as Location from "expo-location";

import { ProjectLocation } from "@/types/project";

export type LocationResult =
  | { status: "granted"; location: ProjectLocation }
  | { status: "denied" | "unavailable"; reason?: string };

export const requestCurrentLocation = async (): Promise<LocationResult> => {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    return { status: "unavailable", reason: "GPS inactif" };
  }

  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== Location.PermissionStatus.GRANTED) {
    return { status: "denied", reason: permission.canAskAgain ? undefined : "Permission refusée" };
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
    mayShowUserSettingsDialog: true,
  });

  return {
    status: "granted",
    location: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? undefined,
      timestamp: position.timestamp,
    },
  };
};
