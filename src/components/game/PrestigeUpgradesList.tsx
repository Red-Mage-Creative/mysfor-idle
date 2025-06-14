import React from 'react';
import { PrestigeUpgrade as PrestigeUpgradeType, Currencies } from '@/lib/gameTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber } from '@/lib/formatters';
import { Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrestigeUpgradesListProps {
  prestigeUpgrades: PrestigeUpgradeType[];
  prestigeUpgradeLevels: Record<string, number>;
  currencies: Currencies;
  onBuyPrestigeUpgrade: (upgradeId: string) => void;
}

const PrestigeUpgradeItem = ({ upgrade, level, currencies, onBuyPrestigeUpgrade }: { upgrade: PrestigeUpgradeType, level: number, currencies: Currencies, onBuyPrestigeUpgrade: (id: string) => void }) => {
    const cost = upgrade.cost(level);
    const canAfford = currencies.aetherShards >= cost;
    const isMaxLevel = level >= upgrade.maxLevel;
    const Icon = upgrade.icon;
    const currentEffect = level > 0 ? upgrade.description(level) : 'No bonus yet.';
    const isGameChanger = ['dimensional_mastery', 'mana_singularity', 'reality_forge'].includes(upgrade.id);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg border bg-card/50 gap-4 transition-all",
                    isGameChanger && "border-amber-400/50 shadow-md shadow-amber-500/10"
                )}>
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                        <Icon className="w-8 h-8 text-amber-400 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-semibold">{upgrade.name}</p>
                            <p className="text-sm text-muted-foreground">Level {level} / {upgrade.maxLevel}</p>
                            <p className="text-sm font-medium text-primary mt-1">{currentEffect}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => onBuyPrestigeUpgrade(upgrade.id)}
                        disabled={!canAfford || isMaxLevel}
                        className="w-28 flex-shrink-0"
                        variant="secondary"
                    >
                        {isMaxLevel ? 'Maxed' : (
                            <div className="flex items-center gap-1">
                                <Gem />
                                <span>{formatNumber(cost)}</span>
                            </div>
                        )}
                    </Button>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                {!isMaxLevel ? (
                    <p>Next Level: {upgrade.description(level + 1)}</p>
                ) : (
                    <p>This upgrade is at its maximum level.</p>
                )}
            </TooltipContent>
        </Tooltip>
    );
}


const PrestigeUpgradesList = ({ prestigeUpgrades, prestigeUpgradeLevels, currencies, onBuyPrestigeUpgrade }: PrestigeUpgradesListProps) => {
  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardHeader className="p-2">
        <CardTitle>Aetherium Forge</CardTitle>
        <CardDescription>Spend Aether Shards on permanent upgrades.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-2">
        {prestigeUpgrades.map((upgrade) => {
          const level = prestigeUpgradeLevels[upgrade.id] || 0;
          return (
            <PrestigeUpgradeItem
              key={upgrade.id}
              upgrade={upgrade}
              level={level}
              currencies={currencies}
              onBuyPrestigeUpgrade={onBuyPrestigeUpgrade}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PrestigeUpgradesList;
