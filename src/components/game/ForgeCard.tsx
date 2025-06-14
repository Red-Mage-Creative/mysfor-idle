import React, { useState, useCallback } from 'react';
import { Zap, Settings, Gem, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Currencies } from '@/lib/gameTypes';
import { formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ForgeCardProps {
    currencies: Currencies;
    generationPerSecond: Partial<Currencies>;
    manaPerClick: number;
    onForgeClick: (clickValue: number) => void;
    showTutorial?: boolean;
}

const ForgeCard = ({ currencies, generationPerSecond, manaPerClick, onForgeClick, showTutorial = false }: ForgeCardProps) => {
    const [isClicking, setIsClicking] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number, text: string }[]>([]);

    const handleForgeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickValue = manaPerClick;
        onForgeClick(clickValue);
        
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 200);

        setFloatingTexts(prev => [...prev, { id: Date.now(), x, y, text: `+${formatNumber(clickValue)}` }]);
        setTimeout(() => {
            setFloatingTexts(current => current.slice(1));
        }, 500);
    }, [manaPerClick, onForgeClick]);

    const otherCurrencies = [
        { key: 'cogwheelGears', name: 'Gears', Icon: Settings, color: 'text-yellow-400', colorLight: 'text-yellow-400/80' },
        { key: 'essenceFlux', name: 'Essence', Icon: Gem, color: 'text-fuchsia-400', colorLight: 'text-fuchsia-400/80' },
        { key: 'researchPoints', name: 'Research', Icon: BrainCircuit, color: 'text-sky-400', colorLight: 'text-sky-400/80' },
    ] as const;

    const visibleCurrencies = otherCurrencies.filter(c => currencies[c.key] > 0 || (generationPerSecond[c.key] || 0) > 0);

    return (
        <Card className="w-full text-center bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg overflow-hidden">
            <CardHeader>
                <CardTitle className="text-4xl font-bold text-primary">{formatNumber(currencies.mana)} Mana</CardTitle>
                <CardDescription className="text-muted-foreground flex justify-center items-center gap-2">
                    <span>{formatNumber(generationPerSecond.mana || 0)}/s</span>
                    <span className="text-xs">|</span>
                    <span>{formatNumber(manaPerClick)}/click</span>
                </CardDescription>

                {visibleCurrencies.length > 0 && (
                    <div className={cn("grid gap-2 mt-4 border-t border-border pt-4", {
                        'grid-cols-1': visibleCurrencies.length === 1,
                        'grid-cols-2': visibleCurrencies.length === 2,
                        'grid-cols-3': visibleCurrencies.length >= 3,
                    })}>
                        {visibleCurrencies.map(c => (
                             <div key={c.key} className="flex flex-col items-center justify-center text-center gap-1">
                                <c.Icon className={cn("w-6 h-6", c.color)} />
                                <div>
                                    <p className="text-lg font-bold">{formatNumber(currencies[c.key])}</p>
                                    <p className="text-xs text-muted-foreground">{c.name}</p>
                                    <p className={cn("text-xs font-semibold", c.colorLight)}>+{formatNumber(generationPerSecond[c.key] || 0)}/s</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent className="relative">
                <button 
                    onClick={handleForgeClick}
                    className={cn(
                        "p-4 rounded-full transition-all duration-200 focus:outline-none group",
                        isClicking ? 'animate-click-bounce' : ''
                    )}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl group-hover:bg-primary/20 duration-500" />
                    <Zap 
                        className="relative w-48 h-48 sm:w-64 sm:h-64 text-primary transition-all group-hover:scale-105" 
                        strokeWidth={1.5}
                    />
                </button>
                {showTutorial && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-28 sm:mt-36 pointer-events-none">
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-xl font-bold text-primary">Click to Forge Mana!</p>
                        </div>
                    </div>
                )}
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
    );
};

export default ForgeCard;
