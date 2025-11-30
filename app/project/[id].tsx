import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";

import { AddPhotoModal } from "@/components/project/AddPhotoModal";
import { PdfExportModal } from "@/components/project/PdfExportModal";
import { PhotosSection } from "@/components/project/PhotosSection";
import { ProjectHero } from "@/components/project/ProjectHero";
import { StatsRow } from "@/components/project/StatsRow";
import { styles } from "@/components/project/styles";
import { useProjectDetails } from "@/hooks/useProjectDetails";

export default function ProjectDetailsScreen() {
  const {
    project,
    loading,
    error,
    sortedPhotos,
    uploading,
    noteDraft,
    setNoteDraft,
    showNoteModal,
    openNoteModal,
    closeNoteModal,
    handleSelectSource,
    openGallery,
    goBack,
    handleSave,
    getPhotoStatus,
    exporting,
    exportUrl,
    exportError,
    handleGeneratePdf,
  } = useProjectDetails(
    (useLocalSearchParams() as { id?: string }).id
  );
  const [pdfStart, setPdfStart] = React.useState("");
  const [pdfEnd, setPdfEnd] = React.useState("");
  const [showPdfModal, setShowPdfModal] = React.useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.helper}>Chargement du chantier...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !project) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.helper}>{error || "Chantier introuvable."}</Text>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderSyncBadge = (
    <View style={styles.syncBadge}>
      <View
        style={[
          styles.syncDot,
          project.hasPendingWrites ? styles.syncDotPending : styles.syncDotSynced,
        ]}
      />
      <Text style={styles.syncBadgeText}>
        {project.hasPendingWrites ? "En attente de synchro" : "Synchronisé"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ProjectHero project={project} onBack={goBack} />

        <StatsRow project={project} />

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            {project.location && (
              <Pressable
                style={styles.chip}
                onPress={() => {
                  if (!project.location) return;
                  const url = `https://www.google.com/maps/search/?api=1&query=${project.location.latitude},${project.location.longitude}`;
                  Linking.openURL(url).catch(() => {});
                }}
              >
                <Ionicons name="map-outline" size={16} color="#0f172a" style={{ marginRight: 6 }} />
                <Text style={styles.chipText}>Ouvrir la carte</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.sectionText}>
            {project.location
              ? `${project.location.latitude.toFixed(5)}, ${project.location.longitude.toFixed(5)}`
              : "Aucune localisation enregistrée pour ce chantier."}
          </Text>
      </View>

      <PhotosSection
        projectId={project.id}
        photos={sortedPhotos}
        getStatus={getPhotoStatus}
        onSeeAll={openGallery}
        onAdd={openNoteModal}
        uploading={uploading}
        renderSyncBadge={renderSyncBadge}
      />

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actions</Text>
        </View>
          <Pressable
            style={[styles.addPhotoButton, { height: 44, justifyContent: "center" }]}
            onPress={() => setShowPdfModal(true)}
          >
            <Ionicons name="document-outline" size={16} color="#0f172a" style={{ marginRight: 6 }} />
            <Text style={styles.addPhotoText}>Générer un rapport PDF</Text>
          </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Ionicons
            name="create-outline"
            size={18}
            color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.saveButtonText}>Modifier le chantier</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AddPhotoModal
        visible={showNoteModal}
        noteDraft={noteDraft}
        onChangeNote={setNoteDraft}
        onClose={closeNoteModal}
        onPickLibrary={() => handleSelectSource("library")}
        onPickCamera={() => handleSelectSource("camera")}
        uploading={uploading}
      />
      <PdfExportModal
        visible={showPdfModal}
        startDate={pdfStart}
        endDate={pdfEnd}
        onChangeStart={setPdfStart}
        onChangeEnd={setPdfEnd}
        onPresetAll={() => {
          setPdfStart("");
          setPdfEnd("");
        }}
        onGenerate={async () => {
          const parseDate = (v: string) => {
            if (!v.trim()) return null;
            const ts = Date.parse(v.trim());
            return Number.isFinite(ts) ? ts : NaN;
          };
          const start = parseDate(pdfStart);
          const end = parseDate(pdfEnd);
          if (Number.isNaN(start) || Number.isNaN(end)) {
            Alert.alert("Dates invalides", "Utilise le format YYYY-MM-DD.");
            return;
          }
          await handleGeneratePdf(start, end || null);
        }}
        onClose={() => setShowPdfModal(false)}
        downloading={exporting}
        downloadUrl={exportUrl}
        error={exportError}
      />
    </SafeAreaView>
  );
}
