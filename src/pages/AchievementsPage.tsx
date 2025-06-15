import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { allAchievements } from '@/lib/achievements';
import { useGame } from '@/context/GameContext';
import AchievementCard from '@/components/game/AchievementCard';
import { AchievementCategory } from '@/lib/gameTypes';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AchievementsPage = () => {
  const { achievements: achievementProgress, achievementBonus } = useGame();

  const categories: AchievementCategory[] = ['First Steps', 'Speed Running', 'Currency Milestones', 'Prestige Master', 'Workshop Mastery', 'Overclock Engineer', 'Research & Development', 'Golem Mastery', 'Cosmic Achievements', 'Efficiency Master', 'Ancient Wisdom', 'Hidden & Fun'];

  const unlockedCount = Object.values(achievementProgress || {}).filter(p => p.unlocked).length;
  const totalCount = allAchievements.length;
  const bonusPercent = achievementBonus ? ((achievementBonus - 1) * 100).toFixed(0) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-4">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">Achievements</h1>
            <p className="mt-2 text-lg text-muted-foreground">
            You've unlocked {unlockedCount} of {totalCount} achievements.
            </p>
            {unlockedCount > 0 && (
              <p className="mt-1 text-lg text-green-500 font-semibold">
                Current bonus: +{bonusPercent}% to all gains!
              </p>
            )}
        </div>
        <Button asChild>
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Game</Link>
        </Button>
      </div>

      {categories.map(category => {
        const achievementsInCategory = allAchievements.filter(a => a.category === category);
        if (achievementsInCategory.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsInCategory.map(ach => (
                <AchievementCard key={ach.id} achievement={ach} progress={achievementProgress?.[ach.id]} />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AchievementsPage;
