import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Screen } from '../App';
import { useState } from 'react';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function LoginScreen({ onNavigate }: LoginScreenProps) {
  const [email, setEmail] = useState('');

  return (
    <div className="h-full flex flex-col px-6 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => onNavigate('welcome')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-2">Connexion / Inscription</h2>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button 
            onClick={() => onNavigate('magic-link')}
            className="w-full"
            disabled={!email}
          >
            Envoyer un code magique
          </Button>

{/*          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Vérifie ta boîte mail, le lien expire dans 30 secondes.
            </p>
          </div>*/}
        </div>
      </div>
    </div>
  );
}
