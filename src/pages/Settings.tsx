
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Trash2, ShieldAlert } from 'lucide-react';

const SettingsPage = () => {
    // These functions would be connected to useGameLogic in a real implementation
    const handleExport = () => alert('Exporting save data... (Feature coming soon!)');
    const handleImport = () => alert('Importing save data... (Feature coming soon!)');
    const handleReset = () => {
        if (confirm('Are you sure you want to reset your game? This action is irreversible.')) {
            alert('Game reset requested. (Feature coming soon!)');
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
                    <CardDescription>Export your progress or import a save file.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button onClick={handleExport} variant="secondary">
                        <Download className="mr-2 h-4 w-4" />
                        Export Save
                    </Button>
                    <Button onClick={handleImport} variant="secondary">
                        <Upload className="mr-2 h-4 w-4" />
                        Import Save
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>These actions are irreversible. Please be certain.</CardDescription>
                </Header>
                <CardContent>
                     <Button onClick={handleReset} variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reset Game Progress
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
