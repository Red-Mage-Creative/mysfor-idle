
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Check, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export type SaveStatus = 'idle' | 'saving' | 'complete' | 'error';

interface SaveStatusProps {
    status: SaveStatus;
    onSave: () => void;
    lastSaveTime: Date | null;
}

const SaveStatusDisplay: React.FC<SaveStatusProps> = ({ status, onSave, lastSaveTime }) => {
    const getButtonContent = () => {
        switch (status) {
            case 'saving':
                return <><Loader2 className="animate-spin" /> Saving...</>;
            case 'complete':
                return <><Check /> Saved!</>;
            case 'error':
                 return <><AlertTriangle /> Error Saving</>;
            default:
                return <><Save /> Save Progress</>;
        }
    };
    
    return (
        <div className="flex items-center gap-4">
            <Button onClick={onSave} disabled={status === 'saving'} variant="secondary" size="sm">
                {getButtonContent()}
            </Button>
            {lastSaveTime && (
                <p className="text-sm text-muted-foreground hidden sm:block">
                    Last saved: {formatDistanceToNow(lastSaveTime, { addSuffix: true })}
                </p>
            )}
        </div>
    );
};

export default SaveStatusDisplay;
