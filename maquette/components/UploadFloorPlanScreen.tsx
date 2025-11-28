import { ArrowLeft, Upload, FileImage } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import type { Screen } from '../App';
import { useState } from 'react';

interface UploadFloorPlanScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function UploadFloorPlanScreen({ onNavigate }: UploadFloorPlanScreenProps) {
  const [hasFile, setHasFile] = useState(false);

  return (
    <div className="h-full flex flex-col px-6 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => onNavigate('project-detail')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2">Charger un plan</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="space-y-6">
          <div>
            <Label>Plan de chantier</Label>
            <p className="text-sm text-gray-500 mb-3">
              Importez un plan (image ou PDF) pour localiser les pièces
            </p>
            
            {/* Upload Area */}
            <button
              onClick={() => setHasFile(true)}
              className="w-full aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {hasFile ? (
                <>
                  <FileImage className="w-16 h-16 text-blue-600" />
                  <div className="text-center">
                    <p className="text-sm">plan_rdc.pdf</p>
                    <p className="text-xs text-gray-500 mt-1">Cliquer pour changer</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm">Cliquer pour charger un fichier</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG ou PDF</p>
                  </div>
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              💡 Comment ça marche ?
            </p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Chargez le plan de votre chantier</li>
              <li>Placez des points sur chaque pièce</li>
              <li>Associez chaque point à une pièce du projet</li>
              <li>Les opérateurs pourront facilement localiser les zones</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => onNavigate('project-detail')}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button 
              onClick={() => onNavigate('annotate-floor-plan')}
              className="flex-1"
              disabled={!hasFile}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
