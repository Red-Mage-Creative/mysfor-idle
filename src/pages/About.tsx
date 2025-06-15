import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, BrainCircuit, Users, Github, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">About Mystic Forge</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Unravel the secrets of arcane energies and technological marvels.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>The Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            In a realm where magic and machinery intertwine, the Mystic Forge stands as a testament to boundless potential. It is a powerful artifact, capable of converting raw thought into tangible energy—mana. You are its chosen keeper, tasked with unlocking its deepest secrets.
          </p>
          <p>
            Your journey will take you from simple mana manipulation to complex automated systems powered by cogwheel gears and mystical fluxes. With each upgrade, you'll delve deeper into the arcane arts, eventually reaching a point of such profound power that you can reshape reality itself through prestige.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Generate Mana</h3>
              <p className="text-muted-foreground">Click the central forge to generate mana. Purchase upgrades to automate mana generation and increase your clicking power.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
                <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Unlock Technologies</h3>
              <p className="text-muted-foreground">Progress through different tiers of technology, from basic magitech to advanced machinery and mystical artifacts, each providing unique bonuses.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Gem className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Prestige for Power</h3>
              <p className="text-muted-foreground">When you've accumulated enough lifetime mana, you can prestige. This resets your progress but grants you Aether Shards, a powerful currency for permanent upgrades.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About This Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Who Made This?</h3>
              <p className="text-muted-foreground">This game was created with Lovable with the help of Google Gemini as a part of the AI Showdown from June 14th 2025 at 8AM CET to June 15th 2025 at 11:59PM CET.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Star us on GitHub!</h3>
              <p className="text-muted-foreground">This project is open-source. If you enjoy it, please consider giving us a star on GitHub!</p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                    <a href="https://github.com/Red-Mage-Creative/mysfor-idle" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <Star className="mr-2 h-4 w-4" />
                        Star on GitHub
                    </a>
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default AboutPage;
