import { ArrowLeft, Plus, Filter, Camera, Clock } from 'lucide-react';
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

interface RoomDetailScreenProps {
  onNavigate: (screen: Screen) => void;
}

type ViewMode = 'timeline' | 'tasks';
type TimelineFilter = 'all' | 'photo' | 'task-update' | 'task-complete';

const mockTasks = [
  { 
    id: 1, 
    title: 'Installation électrique', 
    assignedTo: 'Jean Dupont',
    role: 'Électricien',
    status: 'completed' as const,
    dependencies: [],
    date: '2025-11-01',
    photos: 4
  },
  { 
    id: 2, 
    title: 'Plomberie', 
    assignedTo: 'Pierre Dubois',
    role: 'Plombier',
    status: 'completed' as const,
    dependencies: [],
    date: '2025-11-02',
    photos: 3
  },
  { 
    id: 3, 
    title: 'Pose placo murs', 
    assignedTo: 'Marie Martin',
    role: 'Plaquiste',
    status: 'in-progress' as const,
    dependencies: [1, 2],
    date: '2025-11-04',
    photos: 5
  },
  { 
    id: 4, 
    title: 'Pose placo plafond', 
    assignedTo: 'Marie Martin',
    role: 'Plaquiste',
    status: 'pending' as const,
    dependencies: [3],
    date: null,
    photos: 0
  },
  { 
    id: 5, 
    title: 'Peinture', 
    assignedTo: null,
    role: 'Peintre',
    status: 'pending' as const,
    dependencies: [4],
    date: null,
    photos: 0
  },
];

const timelineEvents = [
  { 
    id: 1, 
    date: '2025-11-04 14:30',
    type: 'photo' as const,
    taskId: 3,
    taskTitle: 'Pose placo murs',
    description: 'Avancement mur nord',
    author: 'Marie Martin'
  },
  { 
    id: 2, 
    date: '2025-11-04 10:15',
    type: 'task-update' as const,
    taskId: 3,
    taskTitle: 'Pose placo murs',
    description: 'Tâche passée en "En cours"',
    author: 'Marie Martin'
  },
  { 
    id: 3, 
    date: '2025-11-02 16:45',
    type: 'task-complete' as const,
    taskId: 2,
    taskTitle: 'Plomberie',
    description: 'Tâche terminée',
    author: 'Pierre Dubois'
  },
  { 
    id: 4, 
    date: '2025-11-02 11:20',
    type: 'photo' as const,
    taskId: 2,
    taskTitle: 'Plomberie',
    description: 'Installation terminée',
    author: 'Pierre Dubois'
  },
  { 
    id: 5, 
    date: '2025-11-01 15:00',
    type: 'task-complete' as const,
    taskId: 1,
    taskTitle: 'Installation électrique',
    description: 'Tâche terminée',
    author: 'Jean Dupont'
  },
];

export function RoomDetailScreen({ onNavigate }: RoomDetailScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all');
  const [taskFilter, setTaskFilter] = useState<string>('all');

  const filteredTasks = mockTasks.filter(task => {
    if (roleFilter !== 'all' && task.role !== roleFilter) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    return true;
  });

  const filteredTimelineEvents = timelineEvents.filter(event => {
    if (timelineFilter !== 'all' && event.type !== timelineFilter) return false;
    if (taskFilter !== 'all' && event.taskId.toString() !== taskFilter) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b border-gray-200 bg-white">
        <div className="flex items-center mb-4">
          <button onClick={() => onNavigate('project-detail')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <h2 className="mb-2">Cuisine</h2>
        <p className="text-sm text-gray-500">5 tâches • 3 en cours • 2 terminées</p>
      </div>

      {/* View Toggle */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setViewMode('tasks')}
          className={`flex-1 px-4 py-3 text-sm transition-colors ${
            viewMode === 'tasks'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Tâches
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`flex-1 px-4 py-3 text-sm transition-colors ${
            viewMode === 'timeline'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Timeline
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tasks View */}
        {viewMode === 'tasks' && (
          <div className="px-6 py-4">
            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="Électricien">Électricien</SelectItem>
                  <SelectItem value="Plombier">Plombier</SelectItem>
                  <SelectItem value="Plaquiste">Plaquiste</SelectItem>
                  <SelectItem value="Peintre">Peintre</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">À faire</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3>Tâches ({filteredTasks.length})</h3>
              <Button size="sm" onClick={() => onNavigate('create-task')}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onNavigate('task-detail')}
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 ${
                      task.status === 'completed' 
                        ? 'bg-green-500 border-green-500' 
                        : task.status === 'in-progress'
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {task.status === 'completed' && (
                        <span className="text-white text-xs flex items-center justify-center">✓</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">{task.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {task.role}
                        </span>
                        {task.assignedTo && (
                          <span>👤 {task.assignedTo}</span>
                        )}
                      </div>
                      
                      {/* Dependencies */}
                      {task.dependencies.length > 0 && (
                        <div className="text-xs text-gray-500 mb-2">
                          🔗 Dépend de {task.dependencies.length} tâche(s)
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {task.status === 'completed' && '✅ Terminée'}
                          {task.status === 'in-progress' && '🔵 En cours'}
                          {task.status === 'pending' && '⏳ À faire'}
                        </span>
                        {task.photos > 0 && (
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {task.photos}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="px-6 py-4">
            {/* Timeline Filters */}
            <div className="flex gap-2 mb-4">
              <Select value={timelineFilter} onValueChange={(val) => setTimelineFilter(val as TimelineFilter)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Type d'événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  <SelectItem value="photo">📷 Photos uniquement</SelectItem>
                  <SelectItem value="task-update">📝 Changements de statut</SelectItem>
                  <SelectItem value="task-complete">✅ Tâches terminées</SelectItem>
                </SelectContent>
              </Select>

              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Toutes les tâches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les tâches</SelectItem>
                  {mockTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3>Historique ({filteredTimelineEvents.length})</h3>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Timeline Events */}
              <div className="space-y-6">
                {filteredTimelineEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onNavigate('task-detail')}
                    className="relative pl-10 w-full text-left hover:opacity-80 transition-opacity"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white ${
                      event.type === 'photo' ? 'bg-blue-500' :
                      event.type === 'task-complete' ? 'bg-green-500' :
                      'bg-gray-400'
                    }`} />

                    {/* Event Card */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm mb-1">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            {event.taskTitle} • {event.author}
                          </p>
                        </div>
                        {event.type === 'photo' && (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xl flex-shrink-0 ml-2">
                            📷
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{event.date}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}