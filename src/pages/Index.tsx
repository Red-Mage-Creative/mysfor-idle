
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { initialUpgrades } from '@/lib/initialUpgrades';
import { Upgrade } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';

const Index = () => {
  const [mana, setMana] = useState<number>(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);
  const [isClicking, setIsClicking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number }[]>([]);

  const manaPerSecond = useMemo(() => {
    return upgrades.reduce((sum, upgrade) => sum + upgrade.mps * upgrade.level, 0);
  }, [upgrades]);
  
  // Game tick for automatic mana generation
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setMana(prev => prev + manaPerSecond / 10);
    }, 100);
    return () => clearInterval(gameLoop);
  }, [manaPerSecond]);
  
  const handleForgeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMana(prev => prev + 1);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    setFloatingTexts(prev => [...prev, { id: Date.now(), x, y }]);
    setTimeout(() => {
        setFloatingTexts(current => current.slice(1));
    }, 500);
  }, []);

  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || mana < upgrade.cost) return;

    setMana(prev => prev - upgrade.cost);
    setUpgrades(prevUpgrades =>
      prevUpgrades.map(u =>
        u.id === upgradeId
          ? {
              ...u,
              level: u.level + 1,
              cost: Math.ceil(u.baseCost * Math.pow(1.15, u.level + 1)),
            }
          : u
      )
    );
  }, [mana, upgrades]);

  const formatNumber = (num: number): string => {
    if (num < 1000) return num.toFixed(1);
    const suffixes = ["", "K", "M", "B", "T"];
    const suffixNum = Math.floor(Math.log10(num) / 3);
    const shortValue = (num / Math.pow(1000, suffixNum)).toFixed(2);
    return `${shortValue}${suffixes[suffixNum]}`;
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
              <CardTitle className="text-4xl font-bold text-primary">{formatNumber(mana)} Mana</CardTitle>
              <CardDescription className="text-muted-foreground">{formatNumber(manaPerSecond)} per second</CardDescription>
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
              {upgrades.map(upgrade => (
                <Card key={upgrade.id} className="flex items-center p-3 transition-colors hover:bg-secondary/50">
                  <upgrade.icon className="w-10 h-10 text-primary/80 mr-4 flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="font-bold text-lg">{upgrade.name}</p>
                    <p className="text-sm text-muted-foreground">Cost: {formatNumber(upgrade.cost)}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-semibold text-xl">{upgrade.level}</p>
                     <p className="text-sm text-muted-foreground">Level</p>
                  </div>
                  <Button 
                    onClick={() => handleBuyUpgrade(upgrade.id)} 
                    disabled={mana < upgrade.cost}
                    size="sm"
                  >
                    Buy
                  </Button>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Index;
