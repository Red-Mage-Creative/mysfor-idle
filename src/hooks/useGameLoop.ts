
import { useEffect } from 'react';
import { Currencies, Currency } from '@/lib/gameTypes';
import * as C from '@/constants/gameConstants';

type UseGameLoopProps = {
    isLoaded: boolean;
    generationPerSecond: Partial<Currencies>;
    setCurrencies: React.Dispatch<React.SetStateAction<Currencies>>;
    setLifetimeMana: React.Dispatch<React.SetStateAction<number>>;
}

export const useGameLoop = ({ isLoaded, generationPerSecond, setCurrencies, setLifetimeMana }: UseGameLoopProps) => {
    useEffect(() => {
        if (!isLoaded) return;

        const gameLoop = setInterval(() => {
            let manaGeneratedThisTick = 0;
            setCurrencies(prev => {
                const newCurrencies = { ...prev };
                for (const key in generationPerSecond) {
                    const currency = key as Currency;
                    const amountGenerated = (generationPerSecond[currency] || 0) / (1000 / C.GAME_TICK_MS);
                    newCurrencies[currency] += amountGenerated;
                    if (currency === 'mana') {
                        manaGeneratedThisTick = amountGenerated;
                    }
                }
                return newCurrencies;
            });
            setLifetimeMana(prev => prev + manaGeneratedThisTick);
        }, C.GAME_TICK_MS);

        return () => clearInterval(gameLoop);
    }, [generationPerSecond, isLoaded, setCurrencies, setLifetimeMana]);
};
