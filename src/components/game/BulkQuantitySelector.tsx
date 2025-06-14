
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { BuyQuantity } from '@/hooks/useGameState';

const options: { value: BuyQuantity; label: string }[] = [
    { value: 1, label: '1x' },
    { value: 5, label: '5x' },
    { value: 10, label: '10x' },
    { value: 'next', label: 'Next' },
    { value: 'max', label: 'Max' },
];

export const BulkQuantitySelector = () => {
    const { buyQuantity, setBuyQuantity } = useGame();

    return (
        <div className="flex w-full items-center gap-1 rounded-lg bg-background p-1 border">
            {options.map(option => (
                <Button
                    key={option.value}
                    variant={buyQuantity === option.value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setBuyQuantity(option.value)}
                    className="flex-1 transition-all"
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
};
