import { ArrowLeft, RefreshCw, Image } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import type { Screen } from '../App';

interface SyncQueueScreenProps {
  onNavigate: (screen: Screen) => void;
}

const syncTasks = [
  { id: 1, name: 'IMG_001.jpg', status: 'uploading' as const, progress: 67 },
  { id: 2, name: 'IMG_002.jpg', status: 'pending' as const, progress: 0 },
  { id: 3, name: 'IMG_003.jpg', status: 'pending' as const, progress: 0 },
  { id: 4, name: 'IMG_004.jpg', status: 'error' as const, progress: 0 },
];

export function SyncQueueScreen({ onNavigate }: SyncQueueScreenProps) {
  const totalProgress = Math.round(
    syncTasks.reduce((acc, task) => acc + task.progress, 0) / syncTasks.length
  );

  return (
    <div className="h-full flex flex-col px-6 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => onNavigate('project-detail')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2">File de synchronisation</h2>
      </div>

      {/* Global Progress */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Progression globale</span>
          <span className="text-sm">{totalProgress}%</span>
        </div>
        <Progress value={totalProgress} className="h-2" />
        <p className="text-xs text-gray-600 mt-2">
          1 en cours, 2 en attente, 1 en erreur
        </p>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <Button className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Forcer la synchronisation maintenant
        </Button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <h3 className="text-sm mb-3">Tâches d'upload</h3>
        
        {syncTasks.map((task) => (
          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <Image className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate">{task.name}</p>
                <p className="text-sm text-gray-500">
                  {task.status === 'uploading' && '⏳ En cours...'}
                  {task.status === 'pending' && '⏸️ En attente'}
                  {task.status === 'error' && '❌ Erreur'}
                </p>
              </div>
            </div>

            {task.status === 'uploading' && (
              <Progress value={task.progress} className="h-1.5" />
            )}

            {task.status === 'error' && (
              <Button size="sm" variant="outline" className="w-full mt-2">
                Réessayer
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
