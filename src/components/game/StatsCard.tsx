
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/formatters';
import { Zap } from 'lucide-react';

interface StatsCardProps {
    manaPerClick: number;
}

const StatsCard = ({ manaPerClick }: StatsCardProps) => {
    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-2 border-primary/10 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Global Stats</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>{formatNumber(manaPerClick)} Mana per click</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default StatsCard;
