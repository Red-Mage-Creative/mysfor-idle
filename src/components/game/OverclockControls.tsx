
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber } from '@/lib/formatters';
import { ChevronsUp, ChevronsDown, Zap, HelpCircle } from 'lucide-react';

interface OverclockInfo {
    currentLevel: number;
    maxLevelUnlocked: number;
    speedMultiplier: number;
    gearDrainPerSecond: number;
    isUnlocked: boolean;
}

interface OverclockControlsProps {
    overclockInfo: OverclockInfo;
    onSetOverclockLevel: (level: number) => void;
}

export const OverclockControls = ({ overclockInfo, onSetOverclockLevel }: OverclockControlsProps) => {
    if (!overclockInfo.isUnlocked) {
        return null;
    }

    const { currentLevel, maxLevelUnlocked, speedMultiplier, gearDrainPerSecond } = overclockInfo;

    return (
        <TooltipProvider>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 border-2 border-fuchsia-500/50 rounded-lg p-2 bg-background/50 mb-4">
                <div className="flex items-center gap-2">
                     <Zap className={cn("w-6 h-6", currentLevel > 0 ? "text-yellow-400 animate-pulse" : "text-muted-foreground")} />
                     <div>
                        <div className="font-bold text-lg flex items-center gap-1.5">
                            Overclock
                             <Tooltip>
                                <TooltipTrigger asChild><HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">
                                        Use gears to boost all production. Unlock more levels via Clockwork Automaton upgrades.
                                        Be careful, as higher levels consume gears much faster!
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <p className="text-xs text-muted-foreground">Level {currentLevel} / {maxLevelUnlocked}</p>
                     </div>
                </div>
                <div className="text-center">
                    <p className="font-semibold text-green-400">x{speedMultiplier.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Speed</p>
                </div>
                <div className="text-center">
                    <p className="font-semibold text-red-400">-{formatNumber(gearDrainPerSecond)}</p>
                    <p className="text-xs text-muted-foreground">Gears/s</p>
                </div>
                <div className="flex items-center gap-1">
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onSetOverclockLevel(currentLevel - 1)}
                                disabled={currentLevel === 0}
                            >
                                <ChevronsDown className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                         <TooltipContent><p>Shift Down</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onSetOverclockLevel(currentLevel + 1)}
                                disabled={currentLevel >= maxLevelUnlocked}
                            >
                                <ChevronsUp className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Shift Up</p></TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
};
