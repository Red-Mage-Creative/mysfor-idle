import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BookOpen, Github, Sparkles, Star, Users, WandSparkles } from "lucide-react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IntroModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

export const IntroModal = ({ isOpen, onClose }: IntroModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(dontShowAgain)}>
      <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <WandSparkles className="mr-2 h-6 w-6 text-purple-400" />
            Welcome to Mystic Forge!
          </DialogTitle>
          <DialogDescription>
            Embark on a journey to master the arts of magic and technology.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow min-h-0">
          <div className="grid gap-4 py-4 pr-4">
            <div className="flex items-start space-x-4 rounded-md border p-4">
              <BookOpen className="mt-1 h-8 w-8 text-blue-400" />
              <div>
                <h3 className="font-semibold">How to Play</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                  <li>Click the large crystal to generate Mana manually.</li>
                  <li>Use Mana to purchase items that automate production.</li>
                  <li>Buy upgrades to enhance the efficiency of your items.</li>
                  <li>Prestige to reset your progress for powerful permanent bonuses.</li>
                  <li>Complete challenges and unlock Golems in the expansive post-game.</li>
                  <li>Your ultimate goal: Forge the final item, the Cosmic Resonator!</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-4 rounded-md border p-4">
              <Sparkles className="mt-1 h-8 w-8 text-yellow-400" />
               <div>
                  <h3 className="font-semibold">About This Game</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                      Mystic Forge is a feature-rich "incremental" or "idle" game. The joy comes from watching numbers go up, making strategic decisions, and unlocking new parts of the game over time. It features multiple prestige layers, over 80 achievements, 9 unique challenges, and a deep end-game that will keep you forging for hours.
                  </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 rounded-md border p-4">
               <Users className="mt-1 h-8 w-8 text-green-400" />
               <div>
                  <h3 className="font-semibold">Who Made This?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                      This game was created with Lovable with the help of Google Gemini as a part of the AI Showdown from June 14th 2025 at 8AM CET to June 15th 2025 at 11:59PM CET.
                  </p>
               </div>
            </div>

            <div className="flex items-start space-x-4 rounded-md border p-4">
               <Github className="mt-1 h-8 w-8 text-neutral-400" />
               <div>
                  <h3 className="font-semibold">Star us on GitHub!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                      This project is open-source. If you enjoy it, please consider giving us a star on GitHub to show your support!
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                      <a href="https://github.com/lovable-dev/mystic-forge-gemini" target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Star className="mr-2 h-4 w-4" />
                          Star on GitHub
                      </a>
                  </Button>
               </div>
            </div>
          </div>
        </ScrollArea>

        <Separator className="flex-shrink-0" />

        <DialogFooter className="sm:justify-between items-center pt-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
                <Checkbox id="dont-show-again" checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(!!checked)} />
                <Label htmlFor="dont-show-again" className="text-sm font-normal text-muted-foreground">
                    Don't show this again
                </Label>
            </div>
          <Button onClick={() => onClose(dontShowAgain)}>Let's Get Forging!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
