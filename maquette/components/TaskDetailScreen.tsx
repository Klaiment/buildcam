import { ArrowLeft, Camera, CheckCircle2, Link2, User, AlertCircle, Play, CheckCheck } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';
import { useState } from 'react';

interface TaskDetailScreenProps {
  onNavigate: (screen: Screen) => void;
}

const taskPhotos = [
  { id: 1, thumbnail: '📷', note: 'Début des travaux', date: '2025-11-04 09:00' },
  { id: 2, thumbnail: '📷', note: 'Mur nord terminé', date: '2025-11-04 14:30' },
  { id: 3, thumbnail: '📷', note: 'Mur est en cours', date: '2025-11-05 10:15' },
];

const dependencies = [
  { id: 1, title: 'Installation électrique', completed: true },
  { id: 2, title: 'Plomberie', completed: true },
];

export function TaskDetailScreen({ onNavigate }: TaskDetailScreenProps) {
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('in-progress');

  const allDependenciesCompleted = dependencies.every(d => d.completed);
  const canStart = allDependenciesCompleted || status !== 'pending';

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b border-gray-200 bg-white">
        <div className="flex items-center mb-4">
          <button onClick={() => onNavigate('room-detail')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <h2 className="mb-3">Pose placo murs</h2>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-3 ${
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status === 'completed' && <><CheckCircle2 className="w-4 h-4" /> Terminée</>}
          {status === 'in-progress' && <><Play className="w-4 h-4" /> En cours</>}
          {status === 'pending' && <><AlertCircle className="w-4 h-4" /> À faire</>}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {status === 'pending' && canStart && (
            <Button 
              size="sm" 
              onClick={() => setStatus('in-progress')}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Démarrer
            </Button>
          )}
          {status === 'in-progress' && (
            <Button 
              size="sm" 
              onClick={() => setStatus('completed')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Marquer terminée
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Assignment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Assigné à</span>
          </div>
          <p className="mb-1">Marie Martin</p>
          <p className="text-sm text-gray-600">Plaquiste</p>
        </div>

        {/* Dependencies */}
        {dependencies.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-gray-600" />
              <h3>Dépendances ({dependencies.length})</h3>
            </div>
            <div className={`border rounded-lg p-4 ${
              allDependenciesCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="space-y-2">
                {dependencies.map((dep) => (
                  <div key={dep.id} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      dep.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {dep.completed && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className={dep.completed ? 'text-gray-700' : 'text-gray-500'}>
                      {dep.title}
                    </span>
                    {dep.completed && (
                      <span className="text-xs text-green-600 ml-auto">Terminée</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3 text-gray-600">
                {allDependenciesCompleted 
                  ? '✅ Toutes les dépendances sont satisfaites'
                  : '⏳ En attente de la complétion des tâches prérequises'
                }
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="mb-2">Description</h3>
          <p className="text-gray-600">
            Installation des plaques de plâtre sur les murs de la cuisine. 
            Surface totale de 40m². Utilisation de plaques BA13 hydrofuges pour la zone évier.
          </p>
        </div>

        {/* Add Photo Button */}
        <div className="mb-6">
          <Button 
            onClick={() => onNavigate('camera')} 
            variant="outline"
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Ajouter une photo
          </Button>
        </div>

        {/* Photos Gallery */}
        <div className="mb-6">
          <h3 className="mb-3">Photos ({taskPhotos.length})</h3>
          <div className="space-y-3">
            {taskPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => onNavigate('photo-detail')}
                className="w-full flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                  {photo.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate mb-1">{photo.note}</p>
                  <p className="text-sm text-gray-500">{photo.date}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
