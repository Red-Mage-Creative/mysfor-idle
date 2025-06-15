
import React from 'react';
import { ResearchNode } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Lock } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';

interface ResearchNodeProps {
  node: ResearchNode;
  isUnlocked: boolean;
  canUnlock: boolean;
  onUnlock: (nodeId: string) => void;
  researchPoints: number;
}

const ResearchNodeComponent: React.FC<ResearchNodeProps> = ({ node, isUnlocked, canUnlock, onUnlock, researchPoints }) => {
  const Icon = node.icon;
  const status = isUnlocked ? 'unlocked' : canUnlock ? 'available' : 'locked';
  const canAfford = researchPoints >= node.cost;

  const handleClick = () => {
    if (status === 'available' && canAfford) {
      onUnlock(node.id);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 transform-gpu',
              {
                'bg-slate-700 border-slate-500 text-slate-400': status === 'locked',
                'bg-green-900 border-green-500 text-white shadow-lg shadow-green-500/50 cursor-pointer hover:scale-110': status === 'unlocked',
                'bg-slate-800 border-yellow-500 text-yellow-300 cursor-pointer hover:scale-110 shadow-lg shadow-yellow-500/20': status === 'available' && canAfford,
                'bg-slate-800 border-red-500 text-red-400 cursor-not-allowed': status === 'available' && !canAfford,
              }
            )}
            style={{ left: `${node.position.x * 7}rem`, top: `${node.position.y * 7}rem`, transform: 'translate(-50%, -50%)' }}
            onClick={handleClick}
          >
            {status === 'locked' && <Lock className="w-6 h-6" />}
            {(status === 'unlocked' || status === 'available') && <Icon className="w-8 h-8" />}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-center">
          <p className="font-bold text-lg">{node.name}</p>
          <p className="text-sm text-muted-foreground mb-2">{node.description}</p>
          {!isUnlocked && (
            <div className="border-t border-border pt-2">
              <p className="font-semibold">Cost: {formatNumber(node.cost)} Research</p>
            </div>
          )}
          {isUnlocked && <p className="text-green-400 font-bold">Researched</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ResearchNodeComponent;
