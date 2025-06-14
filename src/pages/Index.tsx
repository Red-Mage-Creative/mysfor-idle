
import React from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import ForgeCard from '@/components/game/ForgeCard';
import PrestigeCard from '@/components/game/PrestigeCard';
import UpgradesList from '@/components/game/UpgradesList';
import PrestigeUpgradesList from '@/components/game/PrestigeUpgradesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  } = useGameLogic();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-6 order-2 lg:order-1">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight">Mystic Forge</h1>
            <p className="text-muted-foreground mt-2">Harness the arcane and technological.</p>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-6 order-1 lg:order-2">
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
          />
        </div>

        <div className="lg:col-span-1 flex flex-col items-center justify-start order-3">
          <Tabs defaultValue="standard" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Upgrades</TabsTrigger>
              <TabsTrigger value="prestige">Prestige</TabsTrigger>
            </TabsList>
            <TabsContent value="standard">
              <UpgradesList
                currencies={currencies}
                onBuyUpgrade={handleBuyUpgrade}
                upgradeCategories={upgradeCategories}
                categoryUnlockStatus={categoryUnlockStatus}
              />
            </TabsContent>
            <TabsContent value="prestige">
              <PrestigeUpgradesList
                prestigeUpgrades={prestigeUpgrades}
                prestigeUpgradeLevels={prestigeUpgradeLevels}
                currencies={currencies}
                onBuyPrestigeUpgrade={handleBuyPrestigeUpgrade}
              />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
};

export default Index;
