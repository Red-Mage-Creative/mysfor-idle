
import type { GameActionProps } from './actions/types';
import { usePurchaseActions } from './actions/usePurchaseActions';
import { useBulkPurchaseActions } from './actions/useBulkPurchaseActions';
import { usePrestigeActions } from './actions/usePrestigeActions';
import { useGolemActions } from './actions/useGolemActions';
import { useResearchActions } from './actions/useResearchActions';
import { useCoreGameActions } from './actions/useCoreGameActions';
import { useDevActions } from './actions/useDevActions';

export const useGameActions = (props: GameActionProps) => {
    const purchaseActions = usePurchaseActions(props);
    const bulkPurchaseActions = useBulkPurchaseActions(props);
    const prestigeActions = usePrestigeActions(props);
    const golemActions = useGolemActions(props);
    const researchActions = useResearchActions(props);
    const coreActions = useCoreGameActions(props);
    const devActions = useDevActions(props);

    return {
        ...purchaseActions,
        ...bulkPurchaseActions,
        ...prestigeActions,
        ...golemActions,
        ...researchActions,
        ...coreActions,
        ...devActions,
    };
};
