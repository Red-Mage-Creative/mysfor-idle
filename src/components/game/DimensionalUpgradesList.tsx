
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { dimensionalUpgrades } from '@/lib/dimensionalUpgrades';
import { formatNumber } from '@/lib/formatters';
import type { Currencies } from '@/lib/gameTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DimensionalUpgradesListProps {
  currencies: Currencies;
  dimensionalUpgradeLevels: Record<string, number>;
  onBuyDimensionalUpgrade: (upgradeId: string) => void;
}

const DimensionalUpgradesList: React.FC<DimensionalUpgradesListProps> = ({
  currencies,
  dimensionalUpgradeLevels,
  onBuyDimensionalUpgrade,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Dimensional Upgrades</h3>
        <p className="text-sm text-muted-foreground pt-1">
          Spend Challenge Tokens on powerful, permanent upgrades that persist through all Prestiges.
        </p>
      </div>
      <div className="space-y-3">
        {dimensionalUpgrades.map((upgrade) => {
          const level = dimensionalUpgradeLevels[upgrade.id] || 0;
          const cost = upgrade.cost(level);
          const canAfford = (currencies.challengeTokens || 0) >= cost;
          const isMaxLevel = level >= upgrade.maxLevel;

          return (
            <div key={upgrade.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <upgrade.icon className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">{upgrade.name}</h3>
                    <p className="text-sm text-muted-foreground">{upgrade.description(level)}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                    <Progress value={(level / upgrade.maxLevel) * 100} className="w-24 h-2" />
                    <span className="text-sm font-mono text-muted-foreground">
                        Lvl {level}/{upgrade.maxLevel}
                    </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div style={{ minWidth: '150px', textAlign: 'center' }}>
                        <Button
                          onClick={() => onBuyDimensionalUpgrade(upgrade.id)}
                          disabled={!canAfford || isMaxLevel}
                          className="w-full sm:w-auto"
                        >
                          {isMaxLevel ? 'Max Level' : `Cost: ${formatNumber(cost)}`}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!isMaxLevel && (
                      <TooltipContent>
                        <p>Next: {upgrade.description(level + 1)}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DimensionalUpgradesList;
