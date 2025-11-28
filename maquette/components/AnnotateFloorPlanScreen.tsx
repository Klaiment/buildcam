import { ArrowLeft, MapPin, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AnnotateFloorPlanScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface RoomPin {
  id: number;
  x: number;
  y: number;
  roomName: string;
}

const availableRooms = [
  { id: 1, name: 'Cuisine' },
  { id: 2, name: 'Salle de bain principale' },
  { id: 3, name: 'Chambre 1' },
  { id: 4, name: 'Salon' },
];

export function AnnotateFloorPlanScreen({ onNavigate }: AnnotateFloorPlanScreenProps) {
  const [pins, setPins] = useState<RoomPin[]>([
    { id: 1, x: 30, y: 25, roomName: 'Cuisine' },
    { id: 2, x: 70, y: 30, roomName: 'Salle de bain principale' },
  ]);
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);

  const handlePlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPendingPin({ x, y });
    setShowAddModal(true);
  };

  const addPin = (roomName: string) => {
    if (pendingPin) {
      setPins([
        ...pins,
        {
          id: Date.now(),
          x: pendingPin.x,
          y: pendingPin.y,
          roomName,
        },
      ]);
      setPendingPin(null);
      setShowAddModal(false);
    }
  };

  const removePin = (id: number) => {
    setPins(pins.filter(p => p.id !== id));
    setSelectedPin(null);
  };

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b border-gray-200 bg-white">
        <div className="flex items-center mb-4">
          <button onClick={() => onNavigate('project-detail')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2">Placer les pièces</h2>
        </div>
        <p className="text-sm text-gray-500">
          Cliquez sur le plan pour ajouter une pièce
        </p>
      </div>

      {/* Plan with Pins */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div
          onClick={handlePlanClick}
          className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden cursor-crosshair border-2 border-gray-300"
        >
          {/* Mock Floor Plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300">
            <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 border-2 border-gray-400 bg-gray-50/50" />
            <div className="absolute top-1/4 right-1/4 w-1/4 h-1/4 border-2 border-gray-400 bg-gray-50/50" />
            <div className="absolute bottom-1/4 left-1/3 w-1/3 h-1/3 border-2 border-gray-400 bg-gray-50/50" />
          </div>

          {/* Pins */}
          {pins.map((pin) => (
            <div
              key={pin.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPin(pin.id);
              }}
              className={`absolute w-8 h-8 -ml-4 -mt-8 cursor-pointer transition-transform hover:scale-110 ${
                selectedPin === pin.id ? 'scale-125' : ''
              }`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              <MapPin className={`w-8 h-8 ${
                selectedPin === pin.id ? 'text-blue-600' : 'text-red-600'
              } drop-shadow-lg`} fill="currentColor" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md text-xs">
                {pin.roomName}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Pin Actions */}
        {selectedPin && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">
                  {pins.find(p => p.id === selectedPin)?.roomName}
                </p>
                <p className="text-xs text-gray-500">Cliquez sur supprimer pour retirer</p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removePin(selectedPin)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-2">
            📍 Pièces placées: {pins.length}
          </p>
          <div className="space-y-1">
            {pins.map((pin) => (
              <div key={pin.id} className="flex items-center gap-2 text-xs text-blue-700">
                <MapPin className="w-3 h-3" fill="currentColor" />
                <span>{pin.roomName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Pin Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <h3 className="mb-4">Sélectionner une pièce</h3>
            <div className="space-y-3 mb-6">
              {availableRooms.map((room) => {
                const alreadyPlaced = pins.some(p => p.roomName === room.name);
                return (
                  <button
                    key={room.id}
                    onClick={() => addPin(room.name)}
                    disabled={alreadyPlaced}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      alreadyPlaced
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <span>{room.name}</span>
                    {alreadyPlaced && (
                      <span className="ml-2 text-xs">✓ Déjà placée</span>
                    )}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowAddModal(false);
                setPendingPin(null);
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onNavigate('project-detail')}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={() => onNavigate('project-detail')}
            className="flex-1"
            disabled={pins.length === 0}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
