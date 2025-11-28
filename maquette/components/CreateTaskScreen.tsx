import { ArrowLeft, Link2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import type { Screen } from '../App';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CreateTaskScreenProps {
  onNavigate: (screen: Screen) => void;
}

const availableRoles = [
  { value: 'electricien', label: 'Électricien', members: ['Jean Dupont'] },
  { value: 'plombier', label: 'Plombier', members: ['Pierre Dubois'] },
  { value: 'plaquiste', label: 'Plaquiste', members: ['Marie Martin'] },
  { value: 'peintre', label: 'Peintre', members: [] },
];

const existingTasks = [
  { id: 1, title: 'Installation électrique', completed: true },
  { id: 2, title: 'Plomberie', completed: true },
  { id: 3, title: 'Pose placo murs', completed: false },
];

export function CreateTaskScreen({ onNavigate }: CreateTaskScreenProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [dependencies, setDependencies] = useState<number[]>([]);

  const selectedRoleData = availableRoles.find(r => r.value === selectedRole);
  const availableMembers = selectedRoleData?.members || [];

  const toggleDependency = (taskId: number) => {
    if (dependencies.includes(taskId)) {
      setDependencies(dependencies.filter(id => id !== taskId));
    } else {
      setDependencies([...dependencies, taskId]);
    }
  };

  return (
    <div className="h-full flex flex-col px-6 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => onNavigate('room-detail')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2">Créer une tâche</h2>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="task-title">Titre de la tâche *</Label>
            <Input
              id="task-title"
              type="text"
              placeholder="Ex: Pose carrelage sol"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Détails, matériaux nécessaires, contraintes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="role">Corps de métier *</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                    {role.members.length > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({role.members.length})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Member Assignment */}
          {selectedRole && availableMembers.length > 0 && (
            <div>
              <Label htmlFor="member">Assigner à (optionnel)</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Non assigné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Non assigné</SelectItem>
                  {availableMembers.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dependencies */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-gray-600" />
              <Label>Dépendances</Label>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                Cette tâche dépend de :
              </p>
              {existingTasks.length > 0 ? (
                <div className="space-y-2">
                  {existingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`dep-${task.id}`}
                        checked={dependencies.includes(task.id)}
                        onCheckedChange={() => toggleDependency(task.id)}
                      />
                      <label
                        htmlFor={`dep-${task.id}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {task.title}
                        {task.completed && (
                          <span className="ml-2 text-xs text-green-600">✓ Terminée</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune tâche disponible</p>
              )}
            </div>
            {dependencies.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                ℹ️ Cette tâche ne pourra être commencée que lorsque {dependencies.length} tâche(s) sera/seront terminée(s)
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Les dépendances permettent de gérer l'ordre des travaux. Une tâche dépendante ne peut pas commencer avant que ses prérequis soient terminés.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => onNavigate('room-detail')}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={() => onNavigate('room-detail')}
              className="flex-1"
              disabled={!taskTitle.trim() || !selectedRole}
            >
              Créer la tâche
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
