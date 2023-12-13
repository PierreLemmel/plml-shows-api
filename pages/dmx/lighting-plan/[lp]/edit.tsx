import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import { toast } from "@/components/aleas-components/aleas-toast-container";
import LightingPlanEditor from "@/components/dmx/lighting-plan/lighting-plan-editor";
import { getLightingPlan } from "@/lib/services/api/show-control-api";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { useRouter } from "next/router";
import { useState } from "react";

const LightingPlanEdit = () => {

    const router = useRouter();
    const lpName = router.query["lp"] as string|undefined;

    useEffectAsync(async () => {
        if (!lpName) return;

        const lp = await getLightingPlan(lpName)
        setLightingPlan(lp);
    }, [lpName]);

    const [lightingPlan, setLightingPlan] = useState<StageLightingPlan>();
    const onMessage = (msg: string) => toast.info(msg);

    return <AleasMainLayout
        description={`Lighting Plan Edit - ${lightingPlan?.name ?? ""}`}
        toasts
        requireAuth
        navbar
    >
        {lightingPlan ? <LightingPlanEditor
            lightingPlan={lightingPlan}
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