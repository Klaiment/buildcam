# BuildCam – Guide dev rapide

## Prérequis
- Node LTS
- Expo CLI (`npm i -g expo` recommandé)
- Android/iOS simulateur ou Expo Go
- Accès Firebase (fichiers `google-services.json` / `GoogleService-Info.plist` déjà présents)
- Necessite var d'env
- Ne fonctionne pas a cause du OAuth sur expo mobile, only sdk pc
## Installation
```bash
npm install
```
> Si vous voyez un warning de version pour `expo-print` ou `expo-document-picker`, installez la version compatible Expo 54 :
> `npm install expo-print@13.0.0 expo-document-picker@12.0.4 --legacy-peer-deps`

## Lancer l’app
```bash
npm start
```
Puis :
- `a` pour Android (émulateur ou appareil en USB)
- `i` pour iOS (simu Mac)
- `w` pour web (optionnel)

## Environnement
- Expo Router (navigation)
- Firebase (auth, Firestore, Storage)
- Offline : Firestore cache + file d’upload (photos/plans) avec relance auto
- Modules clés : `services/*`, `hooks/*`, `components/*`

## Fonctionnalités principales
- Projets / photos : capture/galerie, statut de synchro, export PDF.
- Pièces / tâches / plans : création par chantier, upload de plans (PDF/image).
- File de sync : écran `sync-queue` pour voir les éléments hors-ligne.

## Conseils dev
- Styles : utilise les styles partagés dans `components/home/sharedStyles.ts` et `components/project/styles.ts`.
- Évite les handlers inline lourds dans les TSX : passe par un hook dédié.
- Pas de `git reset --hard` / ne force pas le revert des changements existants.

## Scripts utiles
- `npm start` : lancer Expo
- `npm run android` / `npm run ios` : build natif via Expo
- `npm run lint` : lint

## Problèmes connus
- IndexedDB manquant sur certains Android : Firestore repasse en mémoire (warning OK).
- Upload : nécessite réseau pour finaliser (photos/plans). File d’attente gère le offline.

## Contact
Si une dépendance manque ou un flux casse (login, upload, export), vérifier les versions Expo et Firebase, puis relancer `npm install`.***

## Features :

-Création de compte par mail + mdp
-OAuth apres build EAS
-Connexion par lien magique (necessite nom de domaine mais ok)
-Mode déconnecté et re-sync une fois online
-Création de chantier
-Création de piece
-Ajout de photo
-Enregistrement dans firebase

