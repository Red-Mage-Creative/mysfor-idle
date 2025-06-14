
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
}

const ForgeCard = ({ currencies, generationPerSecond, manaPerClick, onForgeClick }: ForgeCardProps) => {
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

    return (
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
    );
};

export default ForgeCard;
