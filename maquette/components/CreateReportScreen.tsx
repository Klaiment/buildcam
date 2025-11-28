import { ArrowLeft, Camera, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import type { Screen } from '../App';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CreateReportScreenProps {
  onNavigate: (screen: Screen) => void;
}

const attachedPhotos = [
  { id: 1, thumbnail: '📷' },
  { id: 2, thumbnail: '📷' },
  { id: 3, thumbnail: '📷' },
];

export function CreateReportScreen({ onNavigate }: CreateReportScreenProps) {
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="h-full flex flex-col px-6 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => onNavigate('project-detail')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2">Créer un rapport</h2>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Label htmlFor="report-type">Type de rapport *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Rapport de tâche</SelectItem>
                <SelectItem value="daily">Rapport journalier</SelectItem>
                <SelectItem value="weekly">Rapport hebdomadaire</SelectItem>
                <SelectItem value="global">Rapport global du chantier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportType === 'task' && (
            <div>
              <Label htmlFor="task-select">Tâche associée *</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Sélectionner une tâche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Coulage dalle béton</SelectItem>
                  <SelectItem value="2">Installation électrique</SelectItem>
                  <SelectItem value="3">Pose carrelage salle de bain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="report-title">Titre du rapport *</Label>
            <Input
              id="report-title"
              type="text"
              placeholder="Ex: Rapport coulage dalle - Étage 1"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Compte-rendu *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez ce qui a été réalisé, les observations, les problèmes rencontrés, les solutions appliquées..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
              rows={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              Soyez précis : matériaux utilisés, quantités, durée, équipe présente...
            </p>
          </div>

          {/* Photo Attachments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Photos jointes ({attachedPhotos.length})</Label>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onNavigate('camera')}
              >
                <Camera className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {attachedPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square">
                  <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                    {photo.thumbnail}
                  </div>
                  <button className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => onNavigate('camera')}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Les métadonnées (date, heure, GPS) des photos seront automatiquement incluses dans le rapport
            </p>
          </div>

          <div className="sticky bottom-0 pt-4 bg-white flex gap-3">
            <Button 
              variant="outline"
              onClick={() => onNavigate('project-detail')}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={() => onNavigate('report-detail')}
              className="flex-1"
              disabled={!reportTitle.trim() || !reportType || !description.trim()}
            >
              Générer le rapport
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
