
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Trash2, ShieldAlert } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import SaveStatusDisplay from '@/components/layout/SaveStatus';

const SettingsPage = () => {
    const { exportSave, importSave, resetGame, manualSave, saveStatus, lastSaveTime } = useGame();
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importSave(file);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Settings</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Manage your game data and preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Manually save, export your progress, or import a save file. Your progress is also auto-saved.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SaveStatusDisplay
                        status={saveStatus}
                        onSave={manualSave}
                        lastSaveTime={lastSaveTime}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                        <Button onClick={exportSave} variant="secondary">
                            <Download className="mr-2 h-4 w-4" />
                            Export Save
                        </Button>
                        <Button onClick={handleImportClick} variant="secondary">
                            <Upload className="mr-2 h-4 w-4" />
                            Import Save
                        </Button>
                        <input
                            type="file"
                            ref={importInputRef}
                            onChange={handleFileImport}
                            className="hidden"
                            accept=".txt,application/json"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>These actions are irreversible. Please be certain.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={resetGame} variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset Game Progress
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
