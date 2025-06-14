
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Gem, BrainCircuit } from 'lucide-react';

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

    </div>
  );
};

export default AboutPage;
