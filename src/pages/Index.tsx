import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Zap, Settings, Gem, BrainCircuit, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { initialUpgrades } from '@/lib/initialUpgrades';
import { Upgrade, Currencies, Currency, CurrencyRecord } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';

const PRESTIGE_REQUIREMENT = 1e9; // 1 Billion Mana

const Index = () => {
  const [currencies, setCurrencies] = useState<Currencies>({
    mana: 0,
    cogwheelGears: 0,
    essenceFlux: 0,
    researchPoints: 0,
    aetherShards: 0,
  });
  const [upgrades, setUpgrades] = useState<Upgrade[]>(JSON.parse(JSON.stringify(initialUpgrades)));
  const [isClicking, setIsClicking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number, text: string }[]>([]);

  const [lifetimeMana, setLifetimeMana] = useState(0);
  const [prestige, setPrestige] = useState({
    manaClickMultiplier: 1,
  });

  const generationPerSecond = useMemo(() => {
    return upgrades.reduce((acc, upgrade) => {
      if (upgrade.level > 0) {
        for (const currency in upgrade.generation) {
          const key = currency as Currency;
          acc[key] = (acc[key] || 0) + (upgrade.generation[key] || 0) * upgrade.level;
        }
      }
      return acc;
    }, {} as Partial<Currencies>);
  }, [upgrades]);
  
  useEffect(() => {
    const gameLoop = setInterval(() => {
      let manaGeneratedThisTick = 0;
      setCurrencies(prev => {
        const newCurrencies = { ...prev };
        for (const key in generationPerSecond) {
          const currency = key as Currency;
          const amountGenerated = (generationPerSecond[currency] || 0) / 10;
          newCurrencies[currency] += amountGenerated;
          if (currency === 'mana') {
            manaGeneratedThisTick = amountGenerated;
          }
        }
        return newCurrencies;
      });
      setLifetimeMana(prev => prev + manaGeneratedThisTick);
    }, 100);
    return () => clearInterval(gameLoop);
  }, [generationPerSecond]);
  
  const manaPerClick = useMemo(() => 1 * prestige.manaClickMultiplier, [prestige.manaClickMultiplier]);

  const handleForgeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickValue = manaPerClick;
    setCurrencies(prev => ({ ...prev, mana: prev.mana + clickValue }));
    setLifetimeMana(prev => prev + clickValue);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    setFloatingTexts(prev => [...prev, { id: Date.now(), x, y, text: `+${formatNumber(clickValue)}` }]);
    setTimeout(() => {
        setFloatingTexts(current => current.slice(1));
    }, 500);
  }, [manaPerClick]);

  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
        return currencies[currency as Currency] >= cost;
    });

    if (!canAfford) return;

    setCurrencies(prev => {
        const newCurrencies = { ...prev };
        for (const currency in upgrade.cost) {
            const key = currency as Currency;
            newCurrencies[key] -= upgrade.cost[key] || 0;
        }
        return newCurrencies;
    });
    
    setUpgrades(prevUpgrades =>
      prevUpgrades.map(u => {
        if (u.id !== upgradeId) return u;

        const newLevel = u.level + 1;
        const newCost: CurrencyRecord = {};
        for (const currency in u.baseCost) {
            const key = currency as Currency;
            const base = u.baseCost[key] || 0;
            newCost[key] = Math.ceil(base * Math.pow(1.15, newLevel));
        }

        return {
          ...u,
          level: newLevel,
          cost: newCost,
        };
      })
    );
  }, [currencies, upgrades]);

  const formatNumber = (num: number): string => {
    if (num < 1000) return num.toFixed(1);
    const suffixes = ["", "K", "M", "B", "T"];
    const suffixNum = Math.floor(Math.log10(num) / 3);
    const shortValue = (num / Math.pow(1000, suffixNum)).toFixed(2);
    return `${shortValue}${suffixes[suffixNum]}`;
  };

  const currencyName = (currency: Currency): string => {
    switch (currency) {
      case 'mana': return 'Mana';
      case 'cogwheelGears': return 'Cogwheel Gears';
      case 'essenceFlux': return 'Essence Flux';
      case 'researchPoints': return 'Research Points';
      case 'aetherShards': return 'Aether Shards';
      default: return '';
    }
  };

  const upgradeCategories = useMemo(() => ({
    'Basic Magitech': upgrades.filter(u => u.category === 'Basic Magitech'),
    'Advanced Machinery': upgrades.filter(u => u.category === 'Advanced Machinery'),
    'Mystical Artifacts': upgrades.filter(u => u.category === 'Mystical Artifacts'),
  }), [upgrades]);


  const categoryUnlockStatus = useMemo(() => {
    const totalBasicLevels = upgradeCategories['Basic Magitech'].reduce((sum, u) => sum + u.level, 0);
    return {
      'Basic Magitech': true,
      'Advanced Machinery': totalBasicLevels >= 5 || currencies.mana > 10000,
      'Mystical Artifacts': (upgrades.find(u => u.id === 'clockwork_automaton')?.level || 0) > 0 || currencies.cogwheelGears > 500,
    }
  }, [upgradeCategories, currencies.mana, currencies.cogwheelGears, upgrades]);

  const canPrestige = useMemo(() => lifetimeMana >= PRESTIGE_REQUIREMENT, [lifetimeMana]);
  
  const potentialShards = useMemo(() => {
    if (lifetimeMana < PRESTIGE_REQUIREMENT) return 0;
    return Math.floor(Math.pow(lifetimeMana / 1e9, 0.5) * 5);
  }, [lifetimeMana]);

  const handlePrestige = () => {
    if (!canPrestige) return;

    const shardsGained = potentialShards;
    
    setCurrencies({
      mana: 0,
      cogwheelGears: 0,
      essenceFlux: 0,
      researchPoints: 0,
      aetherShards: currencies.aetherShards + shardsGained,
    });
    
    setUpgrades(JSON.parse(JSON.stringify(initialUpgrades)));

    // This is where prestige upgrades will be bought with shards to update permanent bonuses.
    setPrestige(prev => ({
        ...prev, 
    }));
    
    toast("Dimensional Shift!", {
      description: `You have gained ${shardsGained} Aether Shards. The world resets, but you are stronger.`,
    });
  };

  const categoryTierStyles = {
    'Basic Magitech': 'border-primary/20',
    'Advanced Machinery': 'border-yellow-500/30',
    'Mystical Artifacts': 'border-purple-500/40',
  };


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
          <Card className="w-full text-center bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">{formatNumber(currencies.mana)} Mana</CardTitle>
              <CardDescription className="text-muted-foreground">{formatNumber(generationPerSecond.mana || 0)} per second</CardDescription>
              <div className="grid grid-cols-3 gap-4 mt-4 border-t border-border pt-4 text-left">
                  <div className="flex items-center space-x-2">
                      <Settings className="w-6 h-6 text-yellow-500" />
                      <div>
                          <p className="text-lg font-bold">{formatNumber(currencies.cogwheelGears)}</p>
                          <p className="text-xs text-muted-foreground">Gears</p>
                          <p className="text-xs text-yellow-500/80">+{formatNumber(generationPerSecond.cogwheelGears || 0)}/s</p>
                      </div>
                  </div>
                  <div className="flex items-center space-x-2">
                      <Gem className="w-6 h-6 text-purple-500" />
                      <div>
                          <p className="text-lg font-bold">{formatNumber(currencies.essenceFlux)}</p>
                          <p className="text-xs text-muted-foreground">Essence</p>
                          <p className="text-xs text-purple-500/80">+{formatNumber(generationPerSecond.essenceFlux || 0)}/s</p>
                      </div>
                  </div>
                  <div className="flex items-center space-x-2">
                      <BrainCircuit className="w-6 h-6 text-cyan-500" />
                      <div>
                          <p className="text-lg font-bold">{formatNumber(currencies.researchPoints)}</p>
                          <p className="text-xs text-muted-foreground">Research</p>
                          <p className="text-xs text-cyan-500/80">+{formatNumber(generationPerSecond.researchPoints || 0)}/s</p>
                      </div>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
                <button 
                    onClick={handleForgeClick}
                    className={cn(
                        "p-4 rounded-full transition-transform duration-200 focus:outline-none",
                        isClicking ? 'animate-click-bounce' : ''
                    )}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <Zap className="w-48 h-48 sm:w-64 sm:h-64 text-primary drop-shadow-lg" strokeWidth={1.5} />
                </button>
                {floatingTexts.map(ft => (
                    <div
                        key={ft.id}
                        className="absolute text-2xl font-bold text-primary pointer-events-none animate-float-up"
                        style={{ top: ft.y, left: ft.x }}
                    >
                        {ft.text}
                    </div>
                ))}
            </CardContent>
          </Card>
          <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-amber-500/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-4 text-2xl">
                <Star className="w-8 h-8 text-amber-400" />
                <span>{formatNumber(currencies.aetherShards)} Aether Shards</span>
              </CardTitle>
              <CardDescription>Lifetime Mana: {formatNumber(lifetimeMana)}</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" disabled={!canPrestige} variant="destructive">
                    Dimensional Shift
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Initiate Dimensional Shift?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset your current progress (mana, gears, flux, research, and their upgrades) in exchange for prestige currency.
                      <br /><br />
                      You will gain <strong className="text-amber-400">{potentialShards} Aether Shards</strong>.
                      <br /><br />
                      Aether Shards are used to purchase powerful permanent upgrades that persist through all future resets. Are you sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePrestige}>Shift Dimensions</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Requires {formatNumber(PRESTIGE_REQUIREMENT)} lifetime mana to shift.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col items-center justify-start order-3">
          <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl">Upgrades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
              {Object.entries(upgradeCategories).map(([category, categoryUpgrades]) => {
                  if (!categoryUnlockStatus[category as keyof typeof categoryUnlockStatus]) return null;

                  return (
                    <div key={category}>
                        <h4 className="text-xl font-bold mb-3 text-secondary-foreground">{category}</h4>
                        <div className="space-y-4">
                            {categoryUpgrades.map(upgrade => {
                                const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
                                    return currencies[currency as Currency] >= cost;
                                });
                                return (
                                <Card key={upgrade.id} className={cn("flex items-center p-3 transition-colors hover:bg-secondary/50 border-2", categoryTierStyles[category as keyof typeof categoryTierStyles])}>
                                  <upgrade.icon className="w-10 h-10 text-primary/80 mr-4 flex-shrink-0" />
                                  <div className="flex-grow">
                                    <p className="font-bold text-lg">{upgrade.name}</p>
                                    <p className="text-xs text-muted-foreground/80 italic">{upgrade.description}</p>
                                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                                      <span>Cost:</span>
                                      {Object.entries(upgrade.cost).map(([curr, val]) => (
                                        <span key={curr} className="flex items-center gap-1 font-semibold">
                                          {formatNumber(val || 0)} {currencyName(curr as Currency)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-right mr-4">
                                    <p className="font-semibold text-xl">{upgrade.level}</p>
                                    <p className="text-sm text-muted-foreground">Level</p>
                                  </div>
                                  <Button 
                                    onClick={() => handleBuyUpgrade(upgrade.id)} 
                                    disabled={!canAfford}
                                    size="sm"
                                  >
                                    Buy
                                  </Button>
                                </Card>
                                )
                            })}
                        </div>
                    </div>
                  )
              })}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Index;
