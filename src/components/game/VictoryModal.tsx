
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, PartyPopper } from 'lucide-react';
import { useGame } from '@/context/GameContext';

interface VictoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VictoryModal = ({ isOpen, onClose }: VictoryModalProps) => {
    const game = useGame();
    if (!game) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-400" />
                        Congratulations!
                        <Trophy className="h-6 w-6 text-yellow-400" />
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        You have successfully forged a <strong>Cosmic Resonator</strong> and completed Mystic Forge!
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-center">
                    <PartyPopper className="h-16 w-16 mx-auto text-primary" />
                     <p className="mt-4 text-muted-foreground">
                        You achieved this with <strong>{game.prestigeCount}</strong> prestige(s).
                    </p>
                    <p className="mt-2 text-muted-foreground">
                        Your journey through the arcane arts and magitech has reached its zenith. You can continue playing in this ascended state, or start anew to experience the journey again.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={onClose} className="w-full">
                        Continue Ascended
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
