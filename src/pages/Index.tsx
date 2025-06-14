
import React from 'react';
import { useGame } from '@/context/GameContext';
import ForgeCard from '@/components/game/ForgeCard';
import PrestigeCard from '@/components/game/PrestigeCard';
import ItemsList from '@/components/game/ItemsList';
import ItemUpgradesList from '@/components/game/ItemUpgradesList';
import WorkshopUpgradesList from '@/components/game/WorkshopUpgradesList';
import PrestigeUpgradesList from '@/components/game/PrestigeUpgradesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrestigeVisibility } from '@/components/game/PrestigeCard';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import OfflineEarningsModal from '@/components/game/OfflineEarningsModal';
import SaveStatusDisplay from '@/components/layout/SaveStatus';
import PrestigeBonusesSummary from '@/components/game/PrestigeBonusesSummary';

const Index = () => {
  const {
    isLoaded,
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
    itemPurchaseDetails,
    categoryUnlockStatus,
    prestigeUpgrades,
    prestigeUpgradeLevels,
    handleBuyPrestigeUpgrade,
    prestigeVisibility,
    prestigeRequirement,
    showUpgradesTab,
    availableItemUpgrades,
    handleBuyItemUpgrade,
    showWorkshopTab,
    availableWorkshopUpgrades,
    handleBuyWorkshopUpgrade,
    showTutorial,
    offlineEarnings,
    clearOfflineEarnings,
    manualSave,
    saveStatus,
    lastSaveTime,
    overclockInfo,
    handleSetOverclockLevel,
    prestigeCount,
    prestigeMultipliers,
  } = useGame();

  const showPrestigeTab = prestigeVisibility === 'visible';
  const tabCount = 1 + (showUpgradesTab ? 1 : 0) + (showWorkshopTab ? 1 : 0) + (showPrestigeTab ? 1 : 0);

  if (!isLoaded) {
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 flex flex-col items-stretch space-y-6">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[200px] w-full" />
            </div>
            <div className="lg:col-span-2">
                <Skeleton className="h-[600px] w-full" />
            </div>
        </div>
    );
  }

  return (
    <>
      <OfflineEarningsModal 
        isOpen={!!offlineEarnings}
        onClose={clearOfflineEarnings}
        data={offlineEarnings}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
          
          <div className="lg:col-span-1 flex flex-col items-stretch space-y-6 lg:sticky lg:top-24">
            <ForgeCard 
              currencies={currencies}
              generationPerSecond={generationPerSecond}
              manaPerClick={manaPerClick}
              onForgeClick={addMana}
              showTutorial={showTutorial}
              prestigeMultipliers={prestigeMultipliers}
            />
            {prestigeCount > 0 && <PrestigeBonusesSummary prestigeCount={prestigeCount} prestigeMultipliers={prestigeMultipliers} />}
            <PrestigeCard 
              currencies={currencies}
              lifetimeMana={lifetimeMana}
              canPrestige={canPrestige}
              potentialShards={potentialShards}
              onPrestige={handlePrestige}
              prestigeVisibility={prestigeVisibility as PrestigeVisibility}
              prestigeRequirement={prestigeRequirement}
              prestigeCount={prestigeCount}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col items-center justify-start">
            <div className="w-full flex justify-end mb-2">
              <SaveStatusDisplay
                status={saveStatus}
                onSave={manualSave}
                lastSaveTime={lastSaveTime}
              />
            </div>
            <Tabs defaultValue="items" className="w-full">
              {tabCount > 1 && (
                <TabsList className={cn(
                  "grid w-full",
                  { "grid-cols-2": tabCount === 2, "grid-cols-3": tabCount === 3, "grid-cols-4": tabCount === 4 }
                )}>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  {showUpgradesTab && <TabsTrigger value="upgrades">Upgrades</TabsTrigger>}
                  {showWorkshopTab && <TabsTrigger value="workshop">Workshop</TabsTrigger>}
                  {showPrestigeTab && <TabsTrigger value="prestige">Prestige</TabsTrigger>}
                </TabsList>
              )}
              <TabsContent value="items">
                <ItemsList
                  currencies={currencies}
                  onBuyItem={handleBuyItem}
                  itemCategories={itemCategories}
                  categoryUnlockStatus={categoryUnlockStatus}
                  itemPurchaseDetails={itemPurchaseDetails}
                  overclockInfo={overclockInfo}
                  onSetOverclockLevel={handleSetOverclockLevel}
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
              {showWorkshopTab && (
                <TabsContent value="workshop">
                  <WorkshopUpgradesList
                    currencies={currencies}
                    onBuyWorkshopUpgrade={handleBuyWorkshopUpgrade}
                    availableWorkshopUpgrades={availableWorkshopUpgrades}
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
    </>
  );
};

export default Index;
