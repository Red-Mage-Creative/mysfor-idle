
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

const PRESTIGE_REQUIREMENT = 1e9; // 1 Billion Mana

interface PrestigeCardProps {
    currencies: Currencies;
    lifetimeMana: number;
    canPrestige: boolean;
    potentialShards: number;
    onPrestige: () => void;
}

const PrestigeCard = ({ currencies, lifetimeMana, canPrestige, potentialShards, onPrestige }: PrestigeCardProps) => {
    return (
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
                            <AlertDialogAction onClick={onPrestige}>Shift Dimensions</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    Requires {formatNumber(PRESTIGE_REQUIREMENT)} lifetime mana to shift.
                </p>
            </CardContent>
        </Card>
    );
};

export default PrestigeCard;
