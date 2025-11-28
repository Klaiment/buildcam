import { ArrowLeft, MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';
import { useState } from 'react';

interface FloorPlanViewScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface RoomPin {
  id: number;
  x: number;
  y: number;
  roomName: string;
  tasksTotal: number;
  tasksCompleted: number;
  tasksInProgress: number;
}

const roomPins: RoomPin[] = [
  { 
    id: 1, 
    x: 30, 
    y: 25, 
    roomName: 'Cuisine',
    tasksTotal: 8,
    tasksCompleted: 5,
    tasksInProgress: 2,
  },
  { 
    id: 2, 
    x: 70, 
    y: 30, 
    roomName: 'Salle de bain principale',
    tasksTotal: 12,
    tasksCompleted: 3,
    tasksInProgress: 4,
  },
  { 
    id: 3, 
    x: 45, 
    y: 60, 
    roomName: 'Salon',
    tasksTotal: 10,
    tasksCompleted: 8,
    tasksInProgress: 2,
  },
  { 
    id: 4, 
    x: 20, 
    y: 70, 
    roomName: 'Chambre 1',
    tasksTotal: 6,
    tasksCompleted: 0,
    tasksInProgress: 1,
  },
];

export function FloorPlanViewScreen({ onNavigate }: FloorPlanViewScreenProps) {
  const [selectedRoom, setSelectedRoom] = useState<RoomPin | null>(null);
  const [zoom, setZoom] = useState(1);

  const getProgressColor = (room: RoomPin) => {
    const progress = (room.tasksCompleted / room.tasksTotal) * 100;
    if (progress === 100) return 'text-green-600';
    if (progress > 50) return 'text-blue-600';
    if (progress > 0) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b border-gray-200 bg-white">
        <div className="flex items-center mb-4">
          <button onClick={() => onNavigate('project-detail')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2">Plan du chantier</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center text-sm text-gray-600">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floor Plan */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div
          className="relative mx-auto bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300 origin-top-left transition-transform"
          style={{ 
            width: `${100 * zoom}%`,
            aspectRatio: '4/3',
          }}
        >
          {/* Mock Floor Plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300">
            <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 border-2 border-gray-400 bg-gray-50/50" />
            <div className="absolute top-1/4 right-1/4 w-1/4 h-1/4 border-2 border-gray-400 bg-gray-50/50" />
            <div className="absolute bottom-1/4 left-1/3 w-1/3 h-1/3 border-2 border-gray-400 bg-gray-50/50" />
            <div className="absolute bottom-1/4 left-1/6 w-1/5 h-1/5 border-2 border-gray-400 bg-gray-50/50" />
          </div>

          {/* Room Pins */}
          {roomPins.map((room) => {
            const progress = Math.round((room.tasksCompleted / room.tasksTotal) * 100);
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`absolute w-10 h-10 -ml-5 -mt-10 cursor-pointer transition-transform hover:scale-110 ${
                  selectedRoom?.id === room.id ? 'scale-125 z-10' : ''
                }`}
                style={{ left: `${room.x}%`, top: `${room.y}%` }}
              >
                <MapPin 
                  className={`w-10 h-10 drop-shadow-lg ${getProgressColor(room)}`}
                  fill="currentColor" 
                />
                {/* Progress Badge */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">
                  {progress}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Info Panel */}
      {selectedRoom ? (
        <div className="px-6 py-4 bg-white border-t-2 border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="mb-2">{selectedRoom.roomName}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {selectedRoom.tasksCompleted} / {selectedRoom.tasksTotal} tâches terminées
              </p>
              
              {/* Mini Progress Bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${(selectedRoom.tasksCompleted / selectedRoom.tasksTotal) * 100}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-600">{selectedRoom.tasksCompleted} terminées</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-600">{selectedRoom.tasksInProgress} en cours</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => onNavigate('room-detail')}
            className="w-full"
          >
            Voir les tâches
          </Button>
        </div>
      ) : (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Cliquez sur un point pour voir les détails de la pièce
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 mb-2">Légende :</p>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-green-600" fill="currentColor" />
            <span className="text-gray-600">Terminé</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-blue-600" fill="currentColor" />
            <span className="text-gray-600">En cours</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-orange-600" fill="currentColor" />
            <span className="text-gray-600">Début</span>
          </div>
        </div>
      </div>
    </div>
  );
}
