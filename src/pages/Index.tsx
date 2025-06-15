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
import type { AutoBuyStatus } from '@/components/game/AutoBuyStatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { challenges, challengeMap } from '@/lib/challenges';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, XCircle } from 'lucide-react';
import { OverclockControls } from '@/components/game/OverclockControls';
import DimensionalUpgradesList from '@/components/game/DimensionalUpgradesList';
import { Separator } from '@/components/ui/separator';

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
    ancientKnowledgeNodes,
    prestigeLevelBonus,
    aetherShardBonus,
    ancientKnowledgeBonus,
    synergyBonus,
    activeChallengeId,
    startChallenge,
    abandonChallenge,
    completedChallenges,
    dimensionalUpgrades,
    handleBuyDimensionalUpgrade,
    multiPrestigeDetails,
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

  const showChallengesTab = prestigeCount >= 2;
  const showPrestigeTab = prestigeVisibility === 'visible';
  const tabCount = 1 + (showUpgradesTab ? 1 : 0) + (showWorkshopTab ? 1 : 0) + (showPrestigeTab ? 1 : 0) + (showResearchTab ? 1 : 0) + (showEssenceTab ? 1 : 0) + (showChallengesTab ? 1 : 0);

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
              activeChallengeId={activeChallengeId}
            />
            {prestigeCount > 0 && <PrestigeBonusesSummary
              prestigeCount={prestigeCount}
              prestigeMultipliers={prestigeMultipliers}
              prestigeLevelBonus={prestigeLevelBonus}
              aetherShardBonus={aetherShardBonus}
              ancientKnowledgeBonus={ancientKnowledgeBonus}
              synergyBonus={synergyBonus}
              aetherShards={currencies.aetherShards}
              ancientKnowledgeNodesCount={ancientKnowledgeNodes.size}
            />}
            <PrestigeCard 
              currencies={currencies}
              lifetimeMana={lifetimeMana}
              canPrestige={canPrestige}
              potentialShards={potentialShards}
              onPrestige={handlePrestige}
              prestigeVisibility={prestigeVisibility as PrestigeVisibility}
              prestigeRequirement={prestigeRequirement}
              prestigeCount={prestigeCount}
              multiPrestigeDetails={multiPrestigeDetails}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col items-center justify-start">
            <div className="w-full flex justify-between items-center mb-4">
              {overclockInfo.isUnlocked ? (
                <OverclockControls 
                  overclockInfo={overclockInfo} 
                  onSetOverclockLevel={handleSetOverclockLevel} 
                />
              ) : <div />}
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
                  { "grid-cols-2": tabCount === 2, "grid-cols-3": tabCount === 3, "grid-cols-4": tabCount === 4, "grid-cols-5": tabCount === 5, "grid-cols-6": tabCount === 6, "grid-cols-7": tabCount === 7 }
                )}>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  {showUpgradesTab && <TabsTrigger value="upgrades">Upgrades</TabsTrigger>}
                  {showWorkshopTab && <TabsTrigger value="workshop">Workshop</TabsTrigger>}
                  {showResearchTab && <TabsTrigger value="research">Research</TabsTrigger>}
                  {showEssenceTab && <TabsTrigger value="essence">Essence</TabsTrigger>}
                  {showChallengesTab && <TabsTrigger value="challenges">Challenges</TabsTrigger>}
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
                          currencies={currencies}
                          unlockedNodes={unlockedResearchNodes}
                          onUnlockNode={handleBuyResearch}
                          ancientKnowledgePoints={ancientKnowledgeNodes.size}
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
              {showChallengesTab && (
                <TabsContent value="challenges">
                  <Card>
                      <CardHeader>
                          <CardTitle>Dimensional Challenges</CardTitle>
                          <p className="text-sm text-muted-foreground pt-1">
                              Test your skills in unique runs to earn Challenge Tokens for powerful permanent upgrades.
                              Starting a challenge will reset your run.
                          </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="border rounded-lg p-4 flex justify-between items-center">
                              <div>
                                <p className="font-bold">Challenge Tokens: {formatNumber(currencies.challengeTokens || 0)}</p>
                                <p className="text-sm text-muted-foreground">
                                    Active Challenge: {activeChallengeId ? challengeMap.get(activeChallengeId)?.name : 'None'}
                                </p>
                              </div>
                              {activeChallengeId && (
                                <Button variant="destructive" onClick={() => abandonChallenge()}>Abandon Challenge</Button>
                              )}
                          </div>

                          <Separator />

                          <DimensionalUpgradesList
                            currencies={currencies}
                            dimensionalUpgradeLevels={dimensionalUpgrades}
                            onBuyDimensionalUpgrade={handleBuyDimensionalUpgrade}
                          />
                          
                          <Separator />
                          
                          <div className="space-y-3">
                              {challenges.map(challenge => {
                                  const isUnlocked = prestigeCount >= challenge.unlocksAtPrestige;
                                  const completions = completedChallenges[challenge.id] || 0;
                                  const isCompleted = completions > 0;

                                  return (
                                      <div key={challenge.id} className={cn("border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", !isUnlocked && "bg-muted/50 text-muted-foreground")}>
                                          <div className="flex-1">
                                              <div className="flex items-center gap-3">
                                                  <challenge.icon className={cn("h-6 w-6", isUnlocked ? "text-primary" : "")} />
                                                  <h3 className="text-lg font-semibold">{challenge.name}</h3>
                                                  {!isUnlocked && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> Requires {challenge.unlocksAtPrestige} Prestiges</Badge>}
                                                  {isCompleted && <Badge variant="outline" className="border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900"><CheckCircle2 className="h-3 w-3 mr-1" /> {completions} Completion{completions > 1 ? 's' : ''}</Badge>}
                                              </div>
                                              <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                                              <p className="text-sm mt-1"><b>Goal:</b> {challenge.goalDescription}</p>
                                              <p className="text-sm mt-1"><b>Reward:</b> {challenge.reward} Challenge Tokens</p>
                                          </div>
                                          <div className="flex-shrink-0">
                                            {isUnlocked && (
                                              <Button disabled={!!activeChallengeId} onClick={() => startChallenge(challenge.id)}>
                                                  Start Challenge
                                              </Button>
                                            )}
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </CardContent>
                  </Card>
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
                      lastAutoBuy={lastAutoBuy}
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
