
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Zap, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { initialUpgrades } from '@/lib/initialUpgrades';
import { Upgrade, Currencies, Currency, CurrencyRecord } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';

const Index = () => {
  const [currencies, setCurrencies] = useState<Currencies>({
    mana: 0,
    cogwheelGears: 0,
  });
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);
  const [isClicking, setIsClicking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number }[]>([]);

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
      setCurrencies(prev => {
        const newCurrencies = { ...prev };
        for (const key in generationPerSecond) {
          const currency = key as Currency;
          newCurrencies[currency] += (generationPerSecond[currency] || 0) / 10;
        }
        return newCurrencies;
      });
    }, 100);
    return () => clearInterval(gameLoop);
  }, [generationPerSecond]);
  
  const handleForgeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrencies(prev => ({ ...prev, mana: prev.mana + 1 }));
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    setFloatingTexts(prev => [...prev, { id: Date.now(), x, y }]);
    setTimeout(() => {
        setFloatingTexts(current => current.slice(1));
    }, 500);
  }, []);

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
      default: return '';
    }
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
              <div className="flex justify-center items-center space-x-4 mt-4 border-t border-border pt-4">
                  <div className="flex items-center space-x-2">
                      <Settings className="w-6 h-6 text-primary/80" />
                      <div>
                          <p className="text-xl font-bold">{formatNumber(currencies.cogwheelGears)}</p>
                          <p className="text-xs text-primary/80">+{formatNumber(generationPerSecond.cogwheelGears || 0)}/s</p>
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
                        +1
                    </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col items-center justify-start order-3">
          <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl">Upgrades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {upgrades.map(upgrade => {
                  const canAfford = Object.entries(upgrade.cost).every(([currency, cost]) => {
                      return currencies[currency as Currency] >= cost;
                  });
                  return (
                    <Card key={upgrade.id} className="flex items-center p-3 transition-colors hover:bg-secondary/50">
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
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Index;
