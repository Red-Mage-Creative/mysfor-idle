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
import ResearchTree from '@/components/game/ResearchTree';
import EssenceGolemsList from '@/components/game/EssenceGolemsList';
import { AutoBuyStatusIndicator, AutoBuyStatus } from '@/components/game/AutoBuyStatusIndicator';

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
    showResearchTab,
    showEssenceTab,
    workshopUpgrades,
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
    autoBuySettings,
    toggleAutoBuySetting,
    handleBuyAllItemUpgrades,
    handleBuyAllWorkshopUpgrades,
    unlockedResearchNodes,
    handleBuyResearch,
    handleBuyGolem,
    activeGolemIds,
    setActiveGolemIds,
    allGolems,
    MAX_ACTIVE_GOLEMS,
    golemEffects,
    lastAutoBuy,
  } = useGame();

  const handleToggleGolem = (id: string) => {
    if (activeGolemIds.includes(id)) {
        // Deactivate: no cost refund, just remove from active list
        setActiveGolemIds(prev => prev.filter(golemId => golemId !== id));
    } else {
        // Activate: use existing buy handler to check cost and limits
        handleBuyGolem(id);
    }
  };

  const showPrestigeTab = prestigeVisibility === 'visible';
  const tabCount = 1 + (showUpgradesTab ? 1 : 0) + (showWorkshopTab ? 1 : 0) + (showPrestigeTab ? 1 : 0) + (showResearchTab ? 1 : 0) + (showEssenceTab ? 1 : 0);

  const getAutoBuyStatus = (type: 'items' | 'upgrades'): AutoBuyStatus => {
    const unlocked = type === 'items' ? prestigeMultipliers.autoBuyItemsUnlocked : prestigeMultipliers.autoBuyUpgradesUnlocked;
    const enabled = type === 'items' ? autoBuySettings.items : autoBuySettings.upgrades;
    const golemDisabled = golemEffects.disabledFeatures.has(type === 'items' ? 'autoBuyItems' : 'autoBuyUpgrades');

    if (!unlocked) return 'locked';
    if (golemDisabled) return 'disabled_golem';
    if (!enabled) return 'inactive';
    return 'active';
  }

  const itemAutoBuyStatus = getAutoBuyStatus('items');
  const upgradeAutoBuyStatus = getAutoBuyStatus('upgrades');
  const showAutoBuyStatus = prestigeCount > 0;

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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 items-start animate-fade-in">
          
          <div className="lg:col-span-1 flex flex-col items-stretch space-y-4 md:space-y-6 lg:sticky lg:top-24">
            <ForgeCard 
              currencies={currencies}
              generationPerSecond={generationPerSecond}
              manaPerClick={manaPerClick}
              onForgeClick={addMana}
              showTutorial={showTutorial}
              prestigeMultipliers={prestigeMultipliers}
            />
            {prestigeCount > 0 && <PrestigeBonusesSummary prestigeCount={prestigeCount} prestigeMultipliers={prestigeMultipliers} />}
            {showAutoBuyStatus && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AutoBuyStatusIndicator type="items" status={itemAutoBuyStatus} lastPurchase={lastAutoBuy?.item} />
                    <AutoBuyStatusIndicator type="upgrades" status={upgradeAutoBuyStatus} lastPurchase={lastAutoBuy?.upgrade} />
                </div>
            )}
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
                  { "grid-cols-2": tabCount === 2, "grid-cols-3": tabCount === 3, "grid-cols-4": tabCount === 4, "grid-cols-5": tabCount === 5, "grid-cols-6": tabCount === 6 }
                )}>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  {showUpgradesTab && <TabsTrigger value="upgrades">Upgrades</TabsTrigger>}
                  {showWorkshopTab && <TabsTrigger value="workshop">Workshop</TabsTrigger>}
                  {showResearchTab && <TabsTrigger value="research">Research</TabsTrigger>}
                  {showEssenceTab && <TabsTrigger value="essence">Essence</TabsTrigger>}
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
                    prestigeMultipliers={prestigeMultipliers}
                    onBuyAll={handleBuyAllItemUpgrades}
                  />
                </TabsContent>
              )}
              {showWorkshopTab && (
                <TabsContent value="workshop">
                  <WorkshopUpgradesList
                    currencies={currencies}
                    onBuyWorkshopUpgrade={handleBuyWorkshopUpgrade}
                    workshopUpgrades={workshopUpgrades}
                    onBuyAll={handleBuyAllWorkshopUpgrades}
                  />
                </TabsContent>
              )}
              {showResearchTab && (
                  <TabsContent value="research">
                      <ResearchTree
                          researchPoints={currencies.researchPoints}
                          unlockedNodes={unlockedResearchNodes}
                          onUnlockNode={handleBuyResearch}
                      />
                  </TabsContent>
              )}
              {showEssenceTab && (
                <TabsContent value="essence">
                    <EssenceGolemsList
                        currencies={currencies}
                        onToggleGolem={handleToggleGolem}
                        activeGolemIds={activeGolemIds}
                        allGolems={allGolems}
                        maxActiveGolems={MAX_ACTIVE_GOLEMS}
                        prestigeCount={prestigeCount}
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
                      autoBuySettings={autoBuySettings}
                      onToggleAutoBuy={toggleAutoBuySetting}
                      prestigeMultipliers={prestigeMultipliers}
                      golemEffects={golemEffects}
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
