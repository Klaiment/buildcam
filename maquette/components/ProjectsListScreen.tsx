import { Plus, Search, MapPin, Image, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Screen } from '../App';

interface ProjectsListScreenProps {
  onNavigate: (screen: Screen) => void;
  isOffline: boolean;
}

const mockProjects = [
  {
    id: 1,
    name: 'Rénovation Villa Montagne',
    createdAt: '2025-10-15',
    updatedAt: '2025-11-05',
    photoCount: 127,
    hasGPS: true,
    syncStatus: 'synced' as const,
  },
  {
    id: 2,
    name: 'Construction Immeuble Centre',
    createdAt: '2025-09-20',
    updatedAt: '2025-11-04',
    photoCount: 89,
    hasGPS: true,
    syncStatus: 'pending' as const,
  },
  {
    id: 3,
    name: 'Extension Maison Dupont',
    createdAt: '2025-11-01',
    updatedAt: '2025-11-03',
    photoCount: 34,
    hasGPS: false,
    syncStatus: 'error' as const,
  },
];

export function ProjectsListScreen({ onNavigate, isOffline }: ProjectsListScreenProps) {
  const hasProjects = mockProjects.length > 0;

  return (
    <div className="h-full flex flex-col px-6 pt-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1>Mes projets</h1>
        {isOffline && (
          <p className="text-sm text-gray-500 mt-2">
            Vos données seront envoyées dès le retour du réseau.
          </p>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher un projet..."
          className="pl-10"
        />
      </div>

      {/* Projects List or Empty State */}
      {!hasProjects ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Image className="w-16 h-16 text-gray-300" />
          </div>
          <h3 className="mb-2">Aucun projet</h3>
          <p className="text-gray-500 mb-6">
            Créez votre premier projet pour commencer à documenter vos chantiers
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4">
          {mockProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => onNavigate('project-detail')}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3>{project.name}</h3>
                    {project.hasGPS && (
                      <MapPin className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {project.updatedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      {project.photoCount}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {project.syncStatus === 'synced' && !isOffline && (
                    <div className="w-3 h-3 bg-green-500 rounded-full" title="Synchronisé" />
                  )}
                  {(project.syncStatus === 'pending' || isOffline) && (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" title="En attente" />
                  )}
                  {project.syncStatus === 'error' && !isOffline && (
                    <div className="w-3 h-3 bg-red-500 rounded-full" title="Erreur" />
                  )}
                </div>
              </div>
              
              {isOffline && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>📶</span>
                  <span>Non synchronisé</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => onNavigate('create-project')}
        className="fixed bottom-24 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
