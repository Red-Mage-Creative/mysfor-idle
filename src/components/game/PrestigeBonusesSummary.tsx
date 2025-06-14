
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatNumber } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Gem, Hourglass, ChevronsUp } from 'lucide-react';

interface PrestigeBonusesSummaryProps {
  prestigeCount: number;
  prestigeMultipliers: {
    manaClick: number;
    allProduction: number;
    shardGain: number;
    offlineProduction: number;
  };
}

const formatMultiplier = (value: number) => {
    if (value <= 1) return 'No bonus';
    return `x${formatNumber(value, 2)}`;
}

const PrestigeBonusesSummary = ({ prestigeCount, prestigeMultipliers }: PrestigeBonusesSummaryProps) => {
  if (prestigeCount === 0) return null;

  return (
    <div className="w-full">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-amber-500/20">
          <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>Prestige Bonuses</span>
                <Badge variant="secondary">Lvl {prestigeCount}</Badge>
              </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-card/50 rounded-lg space-y-2 text-sm">
                <p className="text-muted-foreground mb-2">Your current bonuses from all prestige upgrades:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Zap size={16} /> Mana per Click:</span>
                        <span className="font-bold">{formatMultiplier(prestigeMultipliers.manaClick)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><ChevronsUp size={16} /> All Production:</span>
                        <span className="font-bold">{formatMultiplier(prestigeMultipliers.allProduction)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Gem size={16} /> Shard Gain:</span>
                        <span className="font-bold">{formatMultiplier(prestigeMultipliers.shardGain)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Hourglass size={16} /> Offline Earnings:</span>
                        <span className="font-bold">{formatMultiplier(prestigeMultipliers.offlineProduction)}</span>
                    </div>
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PrestigeBonusesSummary;
