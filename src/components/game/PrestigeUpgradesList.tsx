import React from 'react';
import { PrestigeUpgrade as PrestigeUpgradeType, Currencies } from '@/lib/gameTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber } from '@/lib/formatters';
import { Gem } from 'lucide-react';

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

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-2 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-amber-400" />
                        <div>
                            <p className="font-semibold">{upgrade.name}</p>
                            <p className="text-sm text-muted-foreground">Level {level} / {upgrade.maxLevel}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => onBuyPrestigeUpgrade(upgrade.id)}
                        disabled={!canAfford || isMaxLevel}
                        className="w-28"
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
                <p>{level > 0 ? `Current: ${upgrade.description(level)}` : 'No bonus yet.'}</p>
                {!isMaxLevel && <p>Next Level: {upgrade.description(level + 1)}</p>}
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
