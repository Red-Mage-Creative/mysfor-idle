
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Achievement, AchievementProgress } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { Lock } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  progress?: AchievementProgress;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, progress }) => {
  const isUnlocked = progress?.unlocked || false;

  if (achievement.isSecret && !isUnlocked) {
    return (
      <Card className="flex items-center p-4 bg-secondary/30 border-dashed border-muted-foreground/50 text-muted-foreground h-full">
        <Lock className="w-8 h-8 mr-4 flex-shrink-0" />
        <div>
          <p className="font-bold text-lg">Secret Achievement</p>
          <p className="text-xs italic">Keep playing to unlock.</p>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "flex items-center p-4 transition-all duration-300",
            isUnlocked ? "bg-green-950/50 border-green-500/50" : "bg-secondary/50 text-muted-foreground"
          )}>
            <achievement.icon className={cn(
              "w-8 h-8 mr-4 flex-shrink-0",
              isUnlocked ? "text-yellow-400" : "text-muted-foreground/80"
            )} />
            <div className="flex-grow">
              <p className="font-bold text-lg text-card-foreground">{achievement.name}</p>
              <p className="text-xs italic">{achievement.description}</p>
            </div>
          </Card>
        </TooltipTrigger>
        {isUnlocked && progress.unlockedAt && (
          <TooltipContent>
            <p>Unlocked {formatDistanceToNow(new Date(progress.unlockedAt), { addSuffix: true })}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementCard;
