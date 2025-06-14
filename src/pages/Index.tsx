import React from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import ForgeCard from '@/components/game/ForgeCard';
import PrestigeCard from '@/components/game/PrestigeCard';
import UpgradesList from '@/components/game/UpgradesList';
import PrestigeUpgradesList from '@/components/game/PrestigeUpgradesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrestigeVisibility } from '@/components/game/PrestigeCard';

const Index = () => {
  const {
    currencies,
    lifetimeMana,
    generationPerSecond,
    manaPerClick,
    addMana,
    handleBuyUpgrade,
    canPrestige,
    potentialShards,
    handlePrestige,
    upgradeCategories,
    categoryUnlockStatus,
    prestigeUpgrades,
    prestigeUpgradeLevels,
    handleBuyPrestigeUpgrade,
    prestigeVisibility,
  } = useGameLogic();

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-1 flex flex-col items-stretch space-y-6 lg:sticky lg:top-24">
          <ForgeCard 
            currencies={currencies}
            generationPerSecond={generationPerSecond}
            manaPerClick={manaPerClick}
            onForgeClick={addMana}
          />
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
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className={`grid w-full ${prestigeVisibility === 'visible' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <TabsTrigger value="standard">Upgrades</TabsTrigger>
              {prestigeVisibility === 'visible' && <TabsTrigger value="prestige">Prestige</TabsTrigger>}
            </TabsList>
            <TabsContent value="standard">
              <UpgradesList
                currencies={currencies}
                onBuyUpgrade={handleBuyUpgrade}
                upgradeCategories={upgradeCategories}
                categoryUnlockStatus={categoryUnlockStatus}
              />
            </TabsContent>
            {prestigeVisibility === 'visible' && (
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
