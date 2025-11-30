import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SyncBar } from "@/components/home/SyncBar";
import { ProjectsList } from "@/components/home/ProjectsList";
import { CreateProjectModal } from "@/components/home/CreateProjectModal";
import { styles } from "@/components/home/sharedStyles";
import { useProjectsScreen } from "@/hooks/useProjectsScreen";
import {Ionicons} from "@expo/vector-icons";

export default function ProjectsScreen() {
  const {
    checkingAuth,
    currentUser,
    projectName,
    setProjectName,
    projects,
    loadingProjects,
    location,
    locationStatus,
    manualMode,
    setManualMode,
    manualLatitude,
    manualLongitude,
    setManualLatitude,
    setManualLongitude,
    fromCache,
    hasPendingWrites,
    syncing,
    errorMessage,
    showCreateModal,
    fetchLocation,
    handleCreateProject,
    handleSubmitManualLocation,
    handleForceSync,
    openCreateModal,
    closeCreateModal,
    submitting,
  } = useProjectsScreen();

  if (checkingAuth || !currentUser) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logoBadge} />
            <View>
              <Text style={styles.title}>Chantiers</Text>
              <Text style={styles.subtitle}>
                Crée des chantiers et synchronise dès que le réseau revient.
              </Text>
            </View>
          </View>

          <SyncBar
            fromCache={fromCache}
            hasPendingWrites={hasPendingWrites}
            syncing={syncing}
            onSync={handleForceSync}
            userLabel={currentUser?.email || "Connecté"}
          />

          <Pressable style={styles.primaryButton} onPress={openCreateModal}>
            <Text style={styles.primaryButtonText}>Nouveau chantier</Text>
          </Pressable>
          <Text style={styles.helperText}>
            Stocké localement et synchronisé automatiquement quand le réseau est
            de retour.
          </Text>
          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
        </View>

        <ProjectsList projects={projects} loading={loadingProjects} />
      </ScrollView>

      <CreateProjectModal
        visible={showCreateModal}
        onClose={closeCreateModal}
        projectName={projectName}
        onChangeName={setProjectName}
        location={location}
        locationStatus={locationStatus}
        manualMode={manualMode}
        manualLatitude={manualLatitude}
        manualLongitude={manualLongitude}
        onToggleManual={() => setManualMode((prev) => !prev)}
        onChangeLatitude={setManualLatitude}
        onChangeLongitude={setManualLongitude}
        onFetchLocation={fetchLocation}
        onSubmitManualLocation={handleSubmitManualLocation}
        onCreate={handleCreateProject}
        submitting={submitting}
        errorMessage={errorMessage}
      />
    </SafeAreaView>
  );
}
