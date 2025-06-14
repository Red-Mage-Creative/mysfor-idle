
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
    return (
        <div className="flex items-center gap-4">
            <Button onClick={onSave} disabled={status === 'saving'} variant="secondary" size="sm" className="w-36 justify-center">
                {status === 'idle' && <><Save className="mr-2 h-4 w-4" /> Save Progress</>}
                {status === 'saving' && <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>}
                {status === 'complete' && <><Check className="mr-2 h-4 w-4" /> Saved!</>}
                {status === 'error' && <><AlertTriangle className="mr-2 h-4 w-4" /> Error Saving</>}
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
