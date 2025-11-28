import { CheckCircle2 } from 'lucide-react';
import type { Screen } from '../App';
import { useEffect } from 'react';

interface MagicLinkScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function MagicLinkScreen({ onNavigate }: MagicLinkScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNavigate('projects-list');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onNavigate]);

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 pb-16">
      {/* Animation */}
      <div className="mb-8 animate-pulse">
        <CheckCircle2 className="w-24 h-24 text-green-500" />
      </div>

      <h2 className="text-center mb-4">Code validé !</h2>
      <p className="text-center text-gray-500">
        Redirection vers vos projets...
      </p>
    </div>
  );
}
