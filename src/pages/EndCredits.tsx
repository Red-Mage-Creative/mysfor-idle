
import { PartyPopper, Trophy } from 'lucide-react';

const EndCreditsPage = () => {
    return (
        <div className="container mx-auto p-4 py-8 text-center animate-fade-in">
            <Trophy className="mx-auto h-24 w-24 text-yellow-400" />
            <h1 className="mt-4 text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-fuchsia-500 to-primary bg-clip-text text-transparent">
                You've Beaten the Game!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Congratulations on forging the Cosmic Resonator. You have reached the pinnacle of mystic engineering.
            </p>
            <div className="mt-8 text-left max-w-2xl mx-auto space-y-4">
                <h2 className="text-2xl font-semibold text-center">Credits</h2>
                <p><strong>Development & Design:</strong> You, the player!</p>
                <p><strong>AI Assistant:</strong> Lovable</p>
                <p><strong>Special Thanks:</strong> To all the mana crystals, cogwheel gears, and aether shards that made this journey possible.</p>
            </div>
            <PartyPopper className="mx-auto mt-8 h-16 w-16 text-primary animate-pulse" />
        </div>
    );
};

export default EndCreditsPage;
