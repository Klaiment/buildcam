import { ArrowLeft, Plus, Users, LayoutGrid, Map } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';
import { useState } from 'react';

interface ProjectDetailScreenProps {
  onNavigate: (screen: Screen) => void;
  isOffline: boolean;
}

type Tab = 'rooms' | 'floorplan';

const mockRooms = [
  { 
    id: 1, 
    name: 'Cuisine', 
    tasksTotal: 8, 
    tasksCompleted: 5,
    tasksInProgress: 2,
    tasksPending: 1,
    lastUpdate: '2025-11-05'
  },
  { 
    id: 2, 
    name: 'Salle de bain principale', 
    tasksTotal: 12, 
    tasksCompleted: 3,
    tasksInProgress: 4,
    tasksPending: 5,
    lastUpdate: '2025-11-04'
  },
  { 
    id: 3, 
    name: 'Chambre 1', 
    tasksTotal: 6, 
    tasksCompleted: 0,
    tasksInProgress: 1,
    tasksPending: 5,
    lastUpdate: '2025-11-03'
  },
  { 
    id: 4, 
    name: 'Salon', 
    tasksTotal: 10, 
    tasksCompleted: 8,
    tasksInProgress: 2,
    tasksPending: 0,
    lastUpdate: '2025-11-05'
  },
];

const teamMembers = [
  { id: 1, name: 'Jean Dupont', role: 'Électricien' },
  { id: 2, name: 'Marie Martin', role: 'Plaquiste' },
  { id: 3, name: 'Pierre Dubois', role: 'Plombier' },
];

export function ProjectDetailScreen({ onNavigate, isOffline }: ProjectDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('rooms');
  const totalTasks = mockRooms.reduce((sum, room) => sum + room.tasksTotal, 0);
  const completedTasks = mockRooms.reduce((sum, room) => sum + room.tasksCompleted, 0);
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b border-gray-200 bg-white">
        <div className="flex items-center mb-4">
          <button onClick={() => onNavigate('projects-list')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <h2 className="mb-2">Rénovation Villa Montagne</h2>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progression globale</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completedTasks} / {totalTasks} tâches terminées
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm">Équipe ({teamMembers.length})</h3>
          </div>
          <button className="text-sm text-blue-600">Gérer</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex-shrink-0 bg-white border border-gray-200 rounded-lg px-3 py-2"
            >
              <p className="text-sm whitespace-nowrap">{member.name}</p>
              <p className="text-xs text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 px-4 py-3 text-sm transition-colors ${
            activeTab === 'rooms'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <LayoutGrid className="w-4 h-4 inline mr-2" />
          Pièces
        </button>
        <button
          onClick={() => setActiveTab('floorplan')}
          className={`flex-1 px-4 py-3 text-sm transition-colors ${
            activeTab === 'floorplan'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <Map className="w-4 h-4 inline mr-2" />
          Plan
        </button>
      </div>

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Pièces ({mockRooms.length})</h3>
            <Button size="sm" onClick={() => onNavigate('create-room')}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>

          <div className="space-y-3">
            {mockRooms.map((room) => {
              const roomProgress = Math.round((room.tasksCompleted / room.tasksTotal) * 100);
              
              return (
                <button
                  key={room.id}
                  onClick={() => onNavigate('room-detail')}
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="mb-1">{room.name}</h4>
                      <p className="text-xs text-gray-500">
                        Dernière modif: {room.lastUpdate}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{roomProgress}%</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${roomProgress}%` }}
                    />
                  </div>

                  {/* Task Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-600">{room.tasksCompleted} terminées</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600">{room.tasksInProgress} en cours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="text-gray-600">{room.tasksPending} à faire</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floor Plan Tab */}
      {activeTab === 'floorplan' && (
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Plan du chantier</h3>
            <Button size="sm" onClick={() => onNavigate('floor-plan-view')}>
              Voir le plan
            </Button>
          </div>

          <div 
            onClick={() => onNavigate('floor-plan-view')}
            className="relative aspect-[4/3] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Map className="w-12 h-12 mb-2" />
              <p className="text-sm">Aperçu du plan</p>
              <p className="text-xs mt-1">Cliquer pour voir en détail</p>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              📍 Le plan permet de localiser chaque pièce facilement
            </p>
            <p className="text-xs text-blue-700">
              Les opérateurs peuvent voir où se trouve chaque zone de travail et les tâches associées
            </p>
          </div>

          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onNavigate('upload-floor-plan')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Charger un nouveau plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}