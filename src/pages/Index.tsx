
import React from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import ForgeCard from '@/components/game/ForgeCard';
import PrestigeCard from '@/components/game/PrestigeCard';
import ItemsList from '@/components/game/ItemsList';
import ItemUpgradesList from '@/components/game/ItemUpgradesList';
import PrestigeUpgradesList from '@/components/game/PrestigeUpgradesList';
import StatsCard from '@/components/game/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrestigeVisibility } from '@/components/game/PrestigeCard';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
    currencies,
    lifetimeMana,
    generationPerSecond,
    manaPerClick,
    addMana,
    handleBuyItem,
    canPrestige,
    potentialShards,
    handlePrestige,
    itemCategories,
    categoryUnlockStatus,
    prestigeUpgrades,
    prestigeUpgradeLevels,
    handleBuyPrestigeUpgrade,
    prestigeVisibility,
    showUpgradesTab,
    availableItemUpgrades,
    handleBuyItemUpgrade,
  } = useGameLogic();

  const showPrestigeTab = prestigeVisibility === 'visible';
  const tabCount = 1 + (showUpgradesTab ? 1 : 0) + (showPrestigeTab ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-1 flex flex-col items-stretch space-y-6 lg:sticky lg:top-24">
          <ForgeCard 
            currencies={currencies}
            generationPerSecond={generationPerSecond}
            manaPerClick={manaPerClick}
            onForgeClick={addMana}
          />
          <StatsCard manaPerClick={manaPerClick} />
          <PrestigeCard 
            currencies={currencies}
            lifetimeMana={lifetimeMana}
            canPrestige={canPrestige}
            potentialShards={potentialShards}
            onPrestige={handlePrestige}
            prestigeVisibility={prestigeVisibility as PrestigeVisibility}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col items-center justify-start">
          <Tabs defaultValue="items" className="w-full">
            <TabsList className={cn(
              "grid w-full",
              { "grid-cols-1": tabCount === 1, "grid-cols-2": tabCount === 2, "grid-cols-3": tabCount === 3, }
            )}>
              <TabsTrigger value="items">Items</TabsTrigger>
              {showUpgradesTab && <TabsTrigger value="upgrades">Upgrades</TabsTrigger>}
              {showPrestigeTab && <TabsTrigger value="prestige">Prestige</TabsTrigger>}
            </TabsList>
            <TabsContent value="items">
              <ItemsList
                currencies={currencies}
                onBuyItem={handleBuyItem}
                itemCategories={itemCategories}
                categoryUnlockStatus={categoryUnlockStatus}
              />
            </TabsContent>
            {showUpgradesTab && (
              <TabsContent value="upgrades">
                <ItemUpgradesList
                  currencies={currencies}
                  onBuyItemUpgrade={handleBuyItemUpgrade}
                  availableItemUpgrades={availableItemUpgrades}
                />
              </TabsContent>
            )}
            {showPrestigeTab && (
              <TabsContent value="prestige">
                <PrestigeUpgradesList
                    prestigeUpgrades={prestigeUpgrades}
                    prestigeUpgradeLevels={prestigeUpgradeLevels}
                    currencies={currencies}
                    onBuyPrestigeUpgrade={handleBuyPrestigeUpgrade}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

    </div>
  );
};

export default Index;
