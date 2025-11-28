import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { Screen } from '../App';
import { useState } from 'react';

interface CreateRoomScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function CreateRoomScreen({ onNavigate }: CreateRoomScreenProps) {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="h-full flex flex-col px-6 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => onNavigate('project-detail')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2">Ajouter une pièce</h2>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col">
        <div className="space-y-6">
          <div>
            <Label htmlFor="room-name">Nom de la pièce *</Label>
            <Input
              id="room-name"
              type="text"
              placeholder="Ex: Cuisine, Salle de bain, Chambre 1..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Surface, particularités, contraintes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Vous pourrez ajouter des tâches et suivre l'avancement de cette pièce après sa création
            </p>
          </div>

          <Button 
            onClick={() => onNavigate('room-detail')}
            className="w-full"
            disabled={!roomName.trim()}
          >
            Créer la pièce
          </Button>
        </div>
      </div>
    </div>
  );
}
