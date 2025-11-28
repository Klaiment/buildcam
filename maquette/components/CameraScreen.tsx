import { X, MapPin, Circle } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import type { Screen } from '../App';
import { useState } from 'react';

interface CameraScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function CameraScreen({ onNavigate }: CameraScreenProps) {
  const [gpsActive, setGpsActive] = useState(true);
  const [note, setNote] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState(false);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Camera Header */}
      <div className="absolute top-11 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('project-detail')}
          className="p-2 bg-black/50 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
          gpsActive ? 'bg-green-500/80' : 'bg-red-500/80'
        } text-white`}>
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {gpsActive ? 'GPS activé' : 'GPS désactivé'}
          </span>
        </div>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative bg-gray-800 flex items-center justify-center">
        {photoCaptured ? (
          <div className="text-center">
            <div className="text-9xl mb-4">📸</div>
            <p className="text-white">Photo capturée</p>
            {gpsActive && (
              <p className="text-green-400 text-sm mt-2">
                📍 48.8566, 2.3522
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white/70">Vue caméra en direct</p>
            <div className="mt-4 w-full h-px bg-white/20"></div>
            <div className="mt-4 h-px bg-white/20"></div>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      {!photoCaptured ? (
        <div className="p-6 flex items-center justify-center">
          <button
            onClick={() => setPhotoCaptured(true)}
            className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <Circle className="w-16 h-16 text-gray-400 fill-white" />
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-t-3xl">
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block">
              Note (facultatif)
            </label>
            <Textarea
              placeholder="Ajouter une note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {!gpsActive && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ Localisation désactivée (noLocation=true)
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPhotoCaptured(false)}
              className="flex-1"
            >
              Reprendre
            </Button>
            <Button
              onClick={() => onNavigate('project-detail')}
              className="flex-1"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
