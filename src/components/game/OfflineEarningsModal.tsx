
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OfflineEarnings, Currency } from '@/lib/gameTypes';
import { Clock, Sparkles } from 'lucide-react';
import { formatNumber, currencyName } from '@/lib/formatters';

interface OfflineEarningsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: OfflineEarnings | null;
}

const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
}

const OfflineEarningsModal: React.FC<OfflineEarningsModalProps> = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    const earnedCurrencies = Object.entries(data.earnings).filter(([, value]) => value > 0);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="text-yellow-400" />
                        Welcome Back!
                    </DialogTitle>
                    <DialogDescription>
                        While you were away for {formatDuration(data.timeAway)}, your domain continued to flourish.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    <h3 className="font-semibold">Offline Earnings (at 50% rate):</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {earnedCurrencies.map(([currency, value]) => (
                             <li key={currency}>
                                <strong>{formatNumber(Math.floor(value))}</strong> {currencyName(currency as Currency)}
                            </li>
                        ))}
                    </ul>
                     {earnedCurrencies.length === 0 && <p className="text-sm text-muted-foreground">You didn't generate any new resources while away.</p>}
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Collect & Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OfflineEarningsModal;
