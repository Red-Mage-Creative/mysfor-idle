
import React, { useMemo } from 'react';
import { Currency, Currencies, ResearchNode } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { researchNodeMap, researchNodeDependentsMap } from '@/lib/researchTree';

interface ResearchNodeProps {
  node: ResearchNode;
  isUnlocked: boolean;
  canUnlock: boolean;
  onUnlock: (nodeId: string) => void;
  currencies: Currencies;
  nodeSpacing: number;
  unlockedNodes: Set<string>;
}

const ResearchNodeComponent: React.FC<ResearchNodeProps> = ({ node, isUnlocked, canUnlock, onUnlock, currencies, unlockedNodes, nodeSpacing }) => {
  const Icon = node.icon;
  const status = isUnlocked ? 'unlocked' : canUnlock ? 'available' : 'locked';
  
  const canAfford = useMemo(() => {
    if (!node.cost) return true;
    return Object.entries(node.cost).every(([currency, cost]) => {
      return currencies[currency as Currency] >= (cost || 0);
    });
  }, [node.cost, currencies]);

  const dependents = useMemo(() => {
    return (researchNodeDependentsMap.get(node.id) || [])
      .map(id => researchNodeMap.get(id))
      .filter((n): n is ResearchNode => !!n);
  }, [node.id]);

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
                'bg-green-900 border-green-500 text-white shadow-lg shadow-green-500/50': status === 'unlocked',
                'bg-slate-800 border-yellow-500 text-yellow-300 cursor-pointer hover:scale-110 shadow-lg shadow-yellow-500/20': status === 'available' && canAfford,
                'bg-slate-800 border-red-500 text-red-400 cursor-not-allowed': status === 'available' && !canAfford,
              }
            )}
            style={{ 
              left: `${node.position.x * nodeSpacing}rem`, 
              top: `${node.position.y * nodeSpacing}rem`,
            }}
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
            <div className="border-t border-border pt-2 space-y-2">
              {node.prerequisites.length > 0 && (
                <div>
                  <p className="font-semibold">Prerequisites:</p>
                  <ul className="text-left text-xs list-none p-0 space-y-0.5">
                    {node.prerequisites.map(prereqId => {
                      const prereqNode = researchNodeMap.get(prereqId);
                      const isMet = unlockedNodes.has(prereqId);
                      return (
                        <li key={prereqId} className={cn('flex items-center space-x-1.5', { 'text-green-400': isMet, 'text-red-400': !isMet })}>
                          {isMet ? <CheckCircle className="w-3 h-3 flex-shrink-0" /> : <XCircle className="w-3 h-3 flex-shrink-0" />}
                          <span>{prereqNode?.name || prereqId}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div>
                <p className="font-semibold">Cost:</p>
                <ul className="text-left text-xs list-disc list-inside">
                  {Object.entries(node.cost).map(([currency, value]) => (
                      <li key={currency} className={cn({ 'text-red-400': currencies[currency as Currency] < (value || 0) })}>
                        {formatNumber(value)} {currency.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {dependents.length > 0 && (
            <div className="border-t border-border pt-2 mt-2">
              <p className="font-semibold">Unlocks:</p>
              <ul className="text-left text-xs list-disc list-inside">
                {dependents.map(dep => <li key={dep.id}>{dep.name}</li>)}
              </ul>
            </div>
          )}
          {isUnlocked && <p className="text-green-400 font-bold mt-2">Researched</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ResearchNodeComponent;
