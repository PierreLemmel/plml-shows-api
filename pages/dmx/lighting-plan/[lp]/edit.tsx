import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import { aleasToast } from "@/components/aleas-components/aleas-toast-container";
import LightingPlanEditor from "@/components/dmx/lighting-plan/lighting-plan-editor";
import { useRouterQuery } from "@/lib/services/api/routing";
import { getLightingPlan, updateLightingPlan } from "@/lib/services/api/show-control-api";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { useCallback, useState } from "react";

const LightingPlanEdit = () => {

    const {
        "lp": lpName
    } = useRouterQuery("lp");

    useEffectAsync(async () => {
        const lp = await getLightingPlan(lpName)
        setLightingPlan(lp);
    }, [lpName]);

    const [lightingPlan, setLightingPlan] = useState<StageLightingPlan>();
    const onMessage = (msg: string) => aleasToast.info(msg);

    const saveLightingPlan = useCallback<(lp: StageLightingPlan) => Promise<void>>(
        async (lp: StageLightingPlan) => {

            await updateLightingPlan(lp);
            setLightingPlan(lp);
        },
    [])

    return <AleasMainLayout
        description={`Edition du plan de feu - ${lightingPlan?.name ?? ""}`}
        requireAuth
        navbar
    >
        {lightingPlan ? <LightingPlanEditor
            lightingPlan={lightingPlan}
            saveLightingPlan={saveLightingPlan}
            onMessage={onMessage}
        /> :
            <div className="w-full flex flex-col gap-3 items-stretch">
                <div className="text-xl text-center">Chargement du plan de feu...</div>
                <AleasSkeletonLoader lines={6} />
            </div>
        }
    </AleasMainLayout>
}


export default LightingPlanEdit;