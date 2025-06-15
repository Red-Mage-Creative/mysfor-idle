import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Zap, Settings, Gem, BrainCircuit, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Currencies, Currency } from '@/lib/gameTypes';
import { formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface ForgeCardProps {
    currencies: Currencies;
    generationPerSecond: Partial<Currencies>;
    manaPerClick: number;
    onForgeClick: (clickValue: number) => void;
    prestigeMultipliers: {
        allProduction: number;
        manaClick: number;
    };
    showTutorial?: boolean;
    activeChallengeId?: string | null;
}

interface FloatingIcon {
    id: number;
    x: number;
    y: number;
    rotation: number;
    Icon: React.ElementType;
    color: string;
}

const ForgeCard = ({ currencies, generationPerSecond, manaPerClick, onForgeClick, prestigeMultipliers, showTutorial = false, activeChallengeId = null }: ForgeCardProps) => {
    const [isClicking, setIsClicking] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number, text: string }[]>([]);
    const [floatingZaps, setFloatingZaps] = useState<{ id: number; x: number; y: number; rotation: number }[]>([]);
    const [floatingCurrencies, setFloatingCurrencies] = useState<FloatingIcon[]>([]);
    const cardContentRef = useRef<HTMLDivElement>(null);
    
    const isClickingDisabled = activeChallengeId === 'no_clicks';

    const handleForgeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (isClickingDisabled) return;
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

        // Add floating zap effect
        const button = e.currentTarget;
        const centerX = button.offsetLeft + button.offsetWidth / 2;
        const centerY = button.offsetTop + button.offsetHeight / 2;
        const radius = (button.offsetWidth / 2) * (0.6 + Math.random() * 0.6); // 60% to 120% of radius from center
        const angle = Math.random() * Math.PI * 2;
        const zapX = centerX + radius * Math.cos(angle);
        const zapY = centerY + radius * Math.sin(angle);
        const rotation = Math.random() * 90 - 45;
        const newZap = { id: Date.now() + Math.random(), x: zapX, y: zapY, rotation };

        setFloatingZaps(prev => [...prev, newZap]);
        setTimeout(() => {
            setFloatingZaps(current => current.filter(z => z.id !== newZap.id));
        }, 500);

    }, [manaPerClick, onForgeClick, isClickingDisabled]);

    const otherCurrencies = [
        { key: 'cogwheelGears', name: 'Gears', Icon: Settings, color: 'text-yellow-400', colorLight: 'text-yellow-400/80' },
        { key: 'essenceFlux', name: 'Essence', Icon: Gem, color: 'text-fuchsia-400', colorLight: 'text-fuchsia-400/80' },
        { key: 'researchPoints', name: 'Research', Icon: BrainCircuit, color: 'text-sky-400', colorLight: 'text-sky-400/80' },
    ] as const;
    
    const currencyMeta: Record<string, { Icon: React.ElementType; color: string; }> = {
        mana: { Icon: Zap, color: 'text-primary' },
        cogwheelGears: { Icon: Settings, color: 'text-yellow-400' },
        essenceFlux: { Icon: Gem, color: 'text-fuchsia-400' },
        researchPoints: { Icon: BrainCircuit, color: 'text-sky-400' },
    };

    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];
        const element = cardContentRef.current;
        if (!element) return;

        Object.entries(generationPerSecond).forEach(([currency, rate]) => {
            const meta = currencyMeta[currency as Currency];
            if (!meta || !rate || rate <= 0) return;

            // Interval scales with production rate. More production = shorter interval.
            // Capped at 50ms (20/sec) to prevent excessive effects.
            const intervalTime = Math.max(50, 4000 / Math.pow(rate, 0.8));

            const interval = setInterval(() => {
                setFloatingCurrencies(prev => {
                    // Limit total floating icons to avoid performance issues
                    if (prev.length > 20) return prev;

                    const rect = element.getBoundingClientRect();
                    const x = Math.random() * rect.width;
                    const y = Math.random() * rect.height;
                    const rotation = Math.random() * 90 - 45;

                    const newIcon: FloatingIcon = {
                        id: Date.now() + Math.random(),
                        x, y, rotation,
                        Icon: meta.Icon,
                        color: meta.color,
                    };
                    
                    // Automatically remove the icon after the animation finishes
                    setTimeout(() => {
                        setFloatingCurrencies(current => current.filter(c => c.id !== newIcon.id));
                    }, 500);

                    return [...prev, newIcon];
                });
            }, intervalTime);
            intervals.push(interval);
        });

        return () => {
            intervals.forEach(clearInterval);
        };
    }, [generationPerSecond]);

    const visibleCurrencies = otherCurrencies.filter(c => currencies[c.key] > 0 || (generationPerSecond[c.key] || 0) > 0);

    return (
        <Card className="w-full text-center bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg overflow-hidden">
            <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl font-bold text-primary">{formatNumber(currencies.mana)} Mana</CardTitle>
                <CardDescription className="text-muted-foreground flex justify-center items-center gap-2 flex-wrap">
                    <span>{formatNumber(generationPerSecond.mana || 0)}/s</span>
                    <span className="text-xs">|</span>
                    <span>{formatNumber(manaPerClick)}/click</span>
                </CardDescription>

                {visibleCurrencies.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mt-4 border-t border-border pt-4">
                        {visibleCurrencies.map(c => (
                             <div key={c.key} className="flex flex-col items-center justify-center text-center gap-1 min-w-[80px]">
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
            <CardContent ref={cardContentRef} className="relative">
                <div className="relative inline-block">
                    <button 
                        onClick={handleForgeClick}
                        disabled={isClickingDisabled}
                        className={cn(
                            "p-4 rounded-full transition-all duration-200 focus:outline-none group",
                            isClicking ? 'animate-click-bounce' : '',
                            isClickingDisabled && 'cursor-not-allowed'
                        )}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        <Zap 
                            className={cn(
                                "relative w-40 h-40 sm:w-64 sm:h-64 text-primary transition-all duration-100",
                                isClickingDisabled && 'opacity-30'
                            )}
                            strokeWidth={1.5}
                        />
                    </button>
                    {isClickingDisabled && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-background/80 text-foreground p-4 rounded-lg text-center border-2 border-destructive/50 shadow-lg">
                                <Ban className="h-10 w-10 text-destructive mx-auto mb-2" />
                                <p className="font-bold text-lg">Clicks Disabled</p>
                                <p className="text-sm text-muted-foreground">"Hands Off" Challenge Active</p>
                            </div>
                        </div>
                    )}
                </div>
                {showTutorial && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 sm:mt-36 pointer-events-none">
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
                {floatingZaps.map(zap => (
                    <Zap
                        key={zap.id}
                        className="absolute text-sky-400 pointer-events-none animate-zap-pop"
                        size={32}
                        strokeWidth={1.5}
                        style={{
                            top: zap.y,
                            left: zap.x,
                            transform: `translate(-50%, -50%) rotate(${zap.rotation}deg)`,
                        }}
                    />
                ))}
                {floatingCurrencies.map(icon => (
                    <icon.Icon
                        key={icon.id}
                        className={cn("absolute pointer-events-none animate-zap-pop", icon.color)}
                        size={28}
                        strokeWidth={1.5}
                        style={{
                            top: icon.y,
                            left: icon.x,
                            transform: `translate(-50%, -50%) rotate(${icon.rotation}deg)`,
                        }}
                    />
                ))}
            </CardContent>
        </Card>
    );
};

export default ForgeCard;
