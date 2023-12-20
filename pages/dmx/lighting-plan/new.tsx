import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import { toast } from "@/components/aleas-components/aleas-toast-container";
import LightingPlanEditor from "@/components/dmx/lighting-plan/lighting-plan-editor";
import { createLightingPlan, updateLightingPlan } from "@/lib/services/api/show-control-api";
import { generateId } from "@/lib/services/core/utils";
import { StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { useCallback, useEffect, useMemo, useState } from "react";

const NewLightingPlanPage = () => {

    const lightingPlan = useMemo(() => {
        const lp: StageLightingPlan = {
            name: "Test-Name",
            fixtureCollection: "default",
            id: generateId(),
            fixtures: []
        };
        return lp;
    }, [])
    const onMessage = (msg: string) => toast.info(msg);

    const [firstSaved, setFirstSaved] = useState(false);
    const saveLightingPlan = useCallback<(lp: StageLightingPlan) => Promise<void>>(firstSaved ? updateLightingPlan : async (lp: StageLightingPlan) => {
        await createLightingPlan(lp);
        setFirstSaved(true);
    }, [firstSaved])

    return <AleasMainLayout
        description="Nouveau plan de feu"
        toasts
        requireAuth
        navbar
    >
        <LightingPlanEditor
            lightingPlan={lightingPlan}
            onMessage={onMessage}
            saveLightingPlan={saveLightingPlan}
            canRename
            onRename={async (name: string) => { console.log(name)}}
        />
    </AleasMainLayout>
}

export default NewLightingPlanPage;