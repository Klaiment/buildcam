import { ArrowLeft, MapPin, UserPlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import type { Screen } from '../App';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CreateProjectScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

const roles = [
  'Électricien',
  'Plaquiste',
  'Plombier',
  'Maçon',
  'Carreleur',
  'Peintre',
  'Menuisier',
  'Chef de chantier',
];

export function CreateProjectScreen({ onNavigate }: CreateProjectScreenProps) {
  const [projectName, setProjectName] = useState('');
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const addTeamMember = () => {
    if (newMemberName && newMemberRole) {
      setTeamMembers([
        ...teamMembers,
        { id: Date.now(), name: newMemberName, role: newMemberRole }
      ]);
      setNewMemberName('');
      setNewMemberRole('');
    }
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  return (
    <div className="h-full flex flex-col px-6 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => onNavigate('projects-list')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2">Créer un projet</h2>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="project-name">Nom du projet *</Label>
            <Input
              id="project-name"
              type="text"
              placeholder="Ex: Rénovation Villa..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm">Activer la localisation GPS</p>
                <p className="text-xs text-gray-500">Optionnel</p>
              </div>
            </div>
            <Switch
              checked={gpsEnabled}
              onCheckedChange={setGpsEnabled}
            />
          </div>

          {/* Team Management */}
          <div>
            <Label className="mb-3 block">Équipe du chantier</Label>
            
            {/* Add Team Member */}
            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nom de la personne"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-1"
                />
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTeamMember}
                disabled={!newMemberName || !newMemberRole}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter à l'équipe
              </Button>
            </div>

            {/* Team List */}
            {teamMembers.length > 0 && (
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    <button
                      onClick={() => removeTeamMember(member.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ Vous pourrez ajouter des pièces et des tâches après la création du projet
            </p>
          </div>

          <Button 
            onClick={() => onNavigate('project-detail')}
            className="w-full"
            disabled={!projectName.trim()}
          >
            Créer le projet
          </Button>
        </div>
      </div>
    </div>
  );
}
