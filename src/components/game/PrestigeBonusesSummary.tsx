
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Gem, Hourglass, ChevronsUp, Crown, Sparkles, BrainCircuit, ShieldHalf } from 'lucide-react';
import { formatMultiplier, formatNumber } from '@/lib/formatters';

interface PrestigeBonusesSummaryProps {
  prestigeCount: number;
  prestigeMultipliers: {
    manaClick: number;
    allProduction: number;
    shardGain: number;
    offlineProduction: number;
  };
  prestigeLevelBonus?: number;
  aetherShardBonus?: number;
  ancientKnowledgeBonus?: number;
  synergyBonus?: number;
  aetherShards?: number;
  ancientKnowledgeNodesCount?: number;
}

const PrestigeBonusesSummary = ({
    prestigeCount,
    prestigeMultipliers,
    prestigeLevelBonus,
    aetherShardBonus,
    ancientKnowledgeBonus,
    synergyBonus,
    aetherShards,
    ancientKnowledgeNodesCount,
}: PrestigeBonusesSummaryProps) => {
  if (prestigeCount === 0) return null;

  const showGlobalBonuses = (prestigeLevelBonus && prestigeLevelBonus > 1) ||
                            (aetherShardBonus && aetherShardBonus > 1) ||
                            (ancientKnowledgeBonus && ancientKnowledgeBonus > 1) ||
                            (synergyBonus && synergyBonus > 1);

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
            <div className="p-4 bg-card/50 rounded-lg space-y-4 text-sm">
                <div>
                    <p className="text-muted-foreground mb-2">Your current combined bonuses from prestige:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2"><Zap size={16} /> Mana per Click:</span>
                            <span className="font-bold">{formatMultiplier(prestigeMultipliers.manaClick)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2"><ChevronsUp size={16} /> Total Production:</span>
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

                {showGlobalBonuses && (
                    <div>
                        <p className="text-muted-foreground mb-2">Global production modifier breakdown:</p>
                        <div className="space-y-2">
                            {prestigeLevelBonus && prestigeLevelBonus > 1 && (
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Crown size={16} /> Prestige Level {prestigeCount}:</span>
                                    <span className="font-bold text-green-400">{formatMultiplier(prestigeLevelBonus)}</span>
                                </div>
                            )}
                            {aetherShardBonus && aetherShardBonus > 1 && aetherShards != null && (
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2"><Sparkles size={16} /> {formatNumber(aetherShards)} Aether Shards:</span>
                                    <span className="font-bold text-green-400">{formatMultiplier(aetherShardBonus)}</span>
                                </div>
                            )}
                            {ancientKnowledgeBonus && ancientKnowledgeBonus > 1 && ancientKnowledgeNodesCount != null && (
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2"><BrainCircuit size={16} /> {ancientKnowledgeNodesCount} Ancient Knowledge:</span>
                                    <span className="font-bold text-green-400">{formatMultiplier(ancientKnowledgeBonus)}</span>
                                </div>
                            )}
                            {synergyBonus && synergyBonus > 1 && (
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2"><ShieldHalf size={16} /> Synergy Bonus:</span>
                                    <span className="font-bold text-green-400">{formatMultiplier(synergyBonus)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PrestigeBonusesSummary;
