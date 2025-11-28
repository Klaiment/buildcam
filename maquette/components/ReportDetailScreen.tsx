import { ArrowLeft, Download, Share2, Calendar, MapPin, User } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';

interface ReportDetailScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function ReportDetailScreen({ onNavigate }: ReportDetailScreenProps) {
  return (
    <div className="h-full flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center mb-4">
          <button onClick={() => onNavigate('project-detail')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
              Rapport de tâche
            </div>
            <h2>Coulage dalle béton - RDC</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Meta Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Date:</span>
            <span>05 novembre 2025</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Responsable:</span>
            <span>Jean Dupont</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Localisation:</span>
            <span>48.8566, 2.3522</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="mb-3">Résumé</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              Coulage de la dalle béton du rez-de-chaussée effectué avec succès. 
              Surface totale de 120m². Béton dosé à 350kg/m³ avec treillis soudé ST25C.
            </p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="mb-6">
          <h3 className="mb-3">Compte-rendu détaillé</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div>
              <h4 className="mb-2">Travaux réalisés</h4>
              <p className="text-gray-700">
                • Préparation du terrain et mise en place du hérisson (20cm de gravier)<br />
                • Installation du film polyane et du treillis soudé<br />
                • Mise en place du coffrage périphérique<br />
                • Coulage de 15m³ de béton C25/30<br />
                • Lissage et finition à la taloche mécanique
              </p>
            </div>
            
            <div>
              <h4 className="mb-2">Équipe présente</h4>
              <p className="text-gray-700">
                3 maçons + 1 chef de chantier
              </p>
            </div>

            <div>
              <h4 className="mb-2">Durée</h4>
              <p className="text-gray-700">
                09h00 - 17h30 (7h30 effectives)
              </p>
            </div>

            <div>
              <h4 className="mb-2">Observations</h4>
              <p className="text-gray-700">
                Conditions météo favorables (20°C, sec). Temps de prise optimal. 
                Aucun problème rencontré. Délai de séchage: 28 jours avant mise en charge.
              </p>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="mb-6">
          <h3 className="mb-3">Photos jointes (4)</h3>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((photo) => (
              <button
                key={photo}
                onClick={() => onNavigate('photo-detail')}
                className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-xs text-gray-600 px-2 text-center">
                    {photo === 1 && 'Début des travaux'}
                    {photo === 2 && 'Préparation terrain'}
                    {photo === 3 && 'Coffrage terminé'}
                    {photo === 4 && 'Coulage en cours'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 -mx-6 px-6 flex gap-3">
          <Button variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button className="flex-1 bg-blue-600">
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
