
import React from 'react';
import { Zap, ZapOff, Lock, ToyBrick } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type AutoBuyType = 'items' | 'upgrades';
export type AutoBuyStatus = 'active' | 'inactive' | 'locked' | 'disabled_golem';

interface AutoBuyStatusIndicatorProps {
  type: AutoBuyType;
  status: AutoBuyStatus;
  lastPurchase?: string | null;
}

const statusConfig = {
    active: {
        Icon: Zap,
        label: 'Active',
        color: 'text-green-400 animate-pulse',
        tooltip: 'Auto-buy is active and purchasing when possible.'
    },
    inactive: {
        Icon: ZapOff,
        label: 'Inactive',
        color: 'text-muted-foreground',
        tooltip: 'Auto-buy is unlocked but currently turned off.'
    },
    locked: {
        Icon: Lock,
        label: 'Locked',
        color: 'text-red-500',
        tooltip: 'Unlock this feature through Prestige Upgrades.'
    },
    disabled_golem: {
        Icon: ToyBrick,
        label: 'Blocked',
        color: 'text-purple-400',
        tooltip: 'Auto-buy is disabled by an active Golem effect.'
    },
};

export const AutoBuyStatusIndicator = ({ type, status, lastPurchase }: AutoBuyStatusIndicatorProps) => {
    const config = statusConfig[status];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-card/50 border">
                        <config.Icon className={cn("w-5 h-5", config.color)} />
                        <div>
                            <p className="font-semibold text-sm capitalize">{type} Auto-Buy</p>
                            <p className={cn("text-xs font-bold", config.color)}>{config.label}</p>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.tooltip}</p>
                    {status === 'active' && lastPurchase && <p className="mt-1 text-xs">Last purchase: {lastPurchase}</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
