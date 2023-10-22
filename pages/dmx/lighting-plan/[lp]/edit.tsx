import AleasFoldableComponent from "@/components/aleas-components/aleas-foldable-component";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasNumberInput from "@/components/aleas-components/aleas-number-input";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import AleasSlider from "@/components/aleas-components/aleas-slider";
import LightingPlanEditor from "@/components/dmx/lighting-plan/lighting-plan-editor";
import { renameDocument } from "@/lib/services/api/firebase";
import { getLightingPlan, updateLightingPlan } from "@/lib/services/api/show-control-api";
import { sorted } from "@/lib/services/core/arrays";
import { pathCombine } from "@/lib/services/core/files";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { AsyncDipsatch } from "@/lib/services/core/types/utils";
import { mergeClasses, withValue } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";

const LightingPlanEdit = () => {

    const router = useRouter();
    const lpName = router.query["lp"] as string|undefined;

    useEffectAsync(async () => {
        if (!lpName) return;

        const lp = await getLightingPlan(lpName)
        setLightingPlan(lp);
    }, [lpName]);

    const [lightingPlan, setLightingPlan] = useState<StageLightingPlan>();

    const orderedFixtures = useMemo(() => lightingPlan ?
        sorted(Object.values(lightingPlan.fixtures), fixture => fixture.order ?? 0) :
        [], [lightingPlan]);

    const updateFixture = useCallback(async (key: string, fixture: Fixtures.Fixture) => {
        if (!lightingPlan) {
            return;
        }

        const newFixtures = {
            ...lightingPlan.fixtures,
            [key]: fixture
        };

        const newLP = withValue(lightingPlan, "fixtures", newFixtures);
        setLightingPlan(newLP);

        await updateLightingPlan(newLP);

    }, [lightingPlan])

    return <AleasMainLayout
        description={`Lighting Plan Edit - ${lightingPlan?.name ?? ""}`}
        toasts
        requireAuth
        navbar
    >
        {lightingPlan ? <LightingPlanEditor
            lightingPlan={lightingPlan}/> :
            <AleasSkeletonLoader lines={8}
        />}
    </AleasMainLayout>
}


export default LightingPlanEdit;