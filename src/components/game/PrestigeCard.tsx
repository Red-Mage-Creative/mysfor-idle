import React from 'react';
import { Star } from 'lucide-react';
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
import { formatNumber } from '@/lib/formatters';
import { Currencies } from '@/lib/gameTypes';

const PRESTIGE_REQUIREMENT_DEPRECATED = 1e9; // This is no longer the source of truth

export type PrestigeVisibility = 'hidden' | 'teaser' | 'visible';

interface PrestigeCardProps {
    currencies: Currencies;
    lifetimeMana: number;
    canPrestige: boolean;
    potentialShards: number;
    onPrestige: (prestigesToPerform: number, totalShardsToGain: number) => void;
    prestigeVisibility: PrestigeVisibility;
    prestigeRequirement: number;
    prestigeCount: number;
    multiPrestigeDetails: {
        prestigesToGain: number;
        totalShards: number;
        nextPrestigeCount: number;
    };
}

const PrestigeCard = ({ currencies, lifetimeMana, canPrestige, potentialShards, onPrestige, prestigeVisibility, prestigeRequirement, prestigeCount, multiPrestigeDetails }: PrestigeCardProps) => {
    if (prestigeVisibility === 'hidden') {
        return null;
    }

    if (prestigeVisibility === 'teaser') {
        return (
            <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-dashed border-amber-500/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-4 text-xl text-amber-400/80">
                        <Star className="w-8 h-8 text-amber-400/50" />
                        <span>A greater power stirs...</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Continue to grow your power to unlock a new path.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const maxPrestigesPossible = multiPrestigeDetails?.prestigesToGain || 0;

    return (
        <Card className="w-full bg-gradient-to-br from-amber-500/10 via-card/80 to-amber-500/10 backdrop-blur-sm border-2 border-amber-500/40 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-4 text-2xl text-amber-400">
                    <Star className="w-8 h-8 text-amber-400" />
                    <span>{formatNumber(currencies.aetherShards)} Aether Shards</span>
                </CardTitle>
                {prestigeCount > 0 && <CardDescription>Prestige Level: {prestigeCount}</CardDescription>}
                <CardDescription>Lifetime Mana: {formatNumber(lifetimeMana)}</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full bg-gradient-to-r from-destructive to-amber-500 text-destructive-foreground hover:saturate-150 transition-all" disabled={!canPrestige}>
                            Dimensional Shift
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Initiate Dimensional Shift?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will reset your current progress (mana, gears, flux, and their upgrades) in exchange for prestige currency.
                                Your completed research will be converted into permanent <strong className="text-purple-400">Ancient Knowledge</strong>.
                                
                                <div className="my-4 p-3 border rounded-lg bg-background/50">
                                    <h4 className="font-semibold mb-1">Option 1: Shift Once</h4>
                                    You will gain <strong className="text-amber-400">{formatNumber(potentialShards)} Aether Shards</strong> and advance to Prestige Level <strong className="text-green-400">{prestigeCount + 1}</strong>.
                                </div>

                                {maxPrestigesPossible > 1 && (
                                    <div className="my-4 p-3 border rounded-lg bg-background/50">
                                        <h4 className="font-semibold mb-1">Option 2: Shift Maximum ({maxPrestigesPossible} times)</h4>
                                        You will gain a total of <strong className="text-amber-400">{formatNumber(multiPrestigeDetails.totalShards)} Aether Shards</strong> and advance to Prestige Level <strong className="text-green-400">{multiPrestigeDetails.nextPrestigeCount}</strong>.
                                    </div>
                                )}
                                Are you sure you want to proceed?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onPrestige(1, potentialShards)}>Shift Once</AlertDialogAction>
                             {maxPrestigesPossible > 1 && (
                                <AlertDialogAction onClick={() => onPrestige(multiPrestigeDetails.prestigesToGain, multiPrestigeDetails.totalShards)}>
                                    Shift Max (+{multiPrestigeDetails.prestigesToGain})
                                </AlertDialogAction>
                            )}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    {maxPrestigesPossible > 1
                        ? `Shift for up to +${maxPrestigesPossible} levels. Next level requires ${formatNumber(prestigeRequirement)} lifetime mana.`
                        : `Shift for Prestige #${prestigeCount + 1}. Requires ${formatNumber(prestigeRequirement)} lifetime mana.`
                    }
                </p>
            </CardContent>
        </Card>
    );
};

export default PrestigeCard;
