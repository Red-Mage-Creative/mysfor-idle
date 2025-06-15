
import React from 'react';
import { PrestigeUpgrade as PrestigeUpgradeType, Currencies, GolemEffects } from '@/lib/gameTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber } from '@/lib/formatters';
import { Gem, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PrestigeUpgradesListProps {
  prestigeUpgrades: PrestigeUpgradeType[];
  prestigeUpgradeLevels: Record<string, number>;
  currencies: Currencies;
  onBuyPrestigeUpgrade: (upgradeId: string) => void;
  autoBuySettings: { items: boolean, upgrades: boolean };
  onToggleAutoBuy: (setting: 'items' | 'upgrades') => void;
  prestigeMultipliers: { autoBuyItemsUnlocked: boolean, autoBuyUpgradesUnlocked: boolean };
  golemEffects: GolemEffects;
}

const PrestigeUpgradeItem = ({ 
    upgrade, 
    level, 
    currencies, 
    onBuyPrestigeUpgrade,
    autoBuySettings,
    onToggleAutoBuy,
    prestigeMultipliers,
    golemEffects,
}: { 
    upgrade: PrestigeUpgradeType, 
    level: number, 
    currencies: Currencies, 
    onBuyPrestigeUpgrade: (id: string) => void,
    autoBuySettings: { items: boolean, upgrades: boolean },
    onToggleAutoBuy: (setting: 'items' | 'upgrades') => void,
    prestigeMultipliers: { autoBuyItemsUnlocked: boolean, autoBuyUpgradesUnlocked: boolean },
    golemEffects: GolemEffects;
}) => {
    const cost = upgrade.cost(level);
    const canAfford = currencies.aetherShards >= cost;
    const isMaxLevel = level >= upgrade.maxLevel;
    const Icon = upgrade.icon;
    const currentEffect = level > 0 ? upgrade.description(level) : 'No bonus yet.';
    const isGameChanger = ['dimensional_mastery', 'mana_singularity', 'reality_forge'].includes(upgrade.id);
    const isAutoBuyItemsUpgrade = upgrade.effect.type === 'unlockAutoBuyItems';
    const isAutoBuyUpgradesUpgrade = upgrade.effect.type === 'unlockAutoBuyUpgrades';
    const isAutoBuyUpgrade = isAutoBuyItemsUpgrade || isAutoBuyUpgradesUpgrade;
    const autoBuyDisabledByGolem = 
        (isAutoBuyItemsUpgrade && golemEffects.disabledFeatures.has('autoBuyItems')) ||
        (isAutoBuyUpgradesUpgrade && golemEffects.disabledFeatures.has('autoBuyUpgrades'));
    const isLocked = isAutoBuyUpgrade && level === 0;

    const showToggle = isAutoBuyUpgrade && level > 0;

    const getTooltipContent = () => {
        if (isAutoBuyUpgrade) {
            if (autoBuyDisabledByGolem) {
                return <p>Auto-buy is disabled by an active golem's effect.</p>;
            }
            return <p>{upgrade.description(level)}</p>;
        }
        
        if (!isMaxLevel) {
            return <p>Next Level: {upgrade.description(level + 1)}</p>;
        }

        return <p>This upgrade is at its maximum level.</p>;
    };

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
                            <p className="font-semibold flex items-center gap-2">
                                {upgrade.name}
                                {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                            </p>
                            <p className="text-sm text-muted-foreground">Level {level} / {upgrade.maxLevel}</p>
                            <p className="text-sm font-medium text-primary mt-1">{currentEffect}</p>
                        </div>
                    </div>
                    {showToggle ? (
                        <div className="flex items-center space-x-2 w-28 flex-shrink-0 justify-end">
                            <Switch
                                id={`autobuy-${upgrade.id}`}
                                checked={isAutoBuyItemsUpgrade ? autoBuySettings.items : autoBuySettings.upgrades}
                                onCheckedChange={() => onToggleAutoBuy(isAutoBuyItemsUpgrade ? 'items' : 'upgrades')}
                                disabled={autoBuyDisabledByGolem}
                            />
                            <Label 
                                htmlFor={`autobuy-${upgrade.id}`} 
                                className={cn(autoBuyDisabledByGolem && "cursor-not-allowed opacity-50")}
                            >
                                {isAutoBuyItemsUpgrade ? (autoBuySettings.items ? 'On' : 'Off') : (autoBuySettings.upgrades ? 'On' : 'Off')}
                            </Label>
                        </div>
                    ) : (
                        <Button
                            onClick={() => onBuyPrestigeUpgrade(upgrade.id)}
                            disabled={!canAfford || isMaxLevel}
                            className="w-28 flex-shrink-0"
                            variant="secondary"
                        >
                            {isMaxLevel ? 'Maxed' : (
                                !canAfford ? 'Cannot Afford' : (
                                    <div className="flex items-center gap-1">
                                        <Gem />
                                        <span>{formatNumber(cost)}</span>
                                    </div>
                                )
                            )}
                        </Button>
                    )}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                {getTooltipContent()}
            </TooltipContent>
        </Tooltip>
    );
}


const PrestigeUpgradesList = ({ 
    prestigeUpgrades, 
    prestigeUpgradeLevels, 
    currencies, 
    onBuyPrestigeUpgrade,
    autoBuySettings,
    onToggleAutoBuy,
    prestigeMultipliers,
    golemEffects,
}: PrestigeUpgradesListProps) => {
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
              autoBuySettings={autoBuySettings}
              onToggleAutoBuy={onToggleAutoBuy}
              prestigeMultipliers={prestigeMultipliers}
              golemEffects={golemEffects}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PrestigeUpgradesList;
