import { X, MapPin, Calendar, MessageSquare, Share2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';

interface PhotoDetailScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function PhotoDetailScreen({ onNavigate }: PhotoDetailScreenProps) {
  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="absolute top-11 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('project-detail')}
          className="p-2 bg-black/50 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex gap-2">
          <button className="p-2 bg-black/50 rounded-full text-white">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-black/50 rounded-full text-red-500">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Photo Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-9xl">📷</div>
      </div>

      {/* Photo Info */}
      <div className="bg-white rounded-t-3xl p-6 space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <span className="text-sm text-gray-600">Statut de synchronisation</span>
          <span className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-green-600">Synchronisé</span>
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Date et heure</p>
              <p>05 novembre 2025, 14:30</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">Localisation GPS</p>
              <p className="text-sm mb-2">48.8566, 2.3522</p>
              {/* Mini Map */}
              <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-4xl">🗺️</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Note</p>
              <p className="text-gray-500 italic">Aucune note ajoutée</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex gap-3">
          <Button variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button variant="destructive" className="flex-1">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
