import { Camera } from 'lucide-react';
import { Button } from './ui/button';
import type { Screen } from '../App';

interface WelcomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 pb-16">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <Camera className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-center">BuildCam</h1>
        <p className="text-center text-gray-500 mt-2">
          Documentez vos chantiers simplement
        </p>
      </div>

      {/* Main CTA */}
      <div className="w-full space-y-4">
        <Button 
          onClick={() => onNavigate('login')}
          className="w-full"
          size="lg"
        >
          Se connecter / S'inscrire
        </Button>
        
        <p className="text-center text-sm text-gray-500">
          Aucune création de mot de passe nécessaire.
        </p>
      </div>
    </div>
  );
}
