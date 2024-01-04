import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import { aleasToast } from "@/components/aleas-components/aleas-toast-container";
import LightingPlanEditor from "@/components/dmx/lighting-plan/lighting-plan-editor";
import { createLightingPlan, lightingPlanExists, renameLightingPlanIfNeeded, updateLightingPlan } from "@/lib/services/api/show-control-api";
import { AsyncDispatch } from "@/lib/services/core/types/utils";
import { generateId } from "@/lib/services/core/utils";
import { StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { useCallback, useState } from "react";

const NewLightingPlanPage = () => {

    const [lightingPlan, setLightingPlan] = useState<StageLightingPlan>({
        name: "Nouveau PdF",
        fixtureCollection: "default",
        id: generateId(),
        fixtures: []
    })

    const [firstSaved, setFirstSaved] = useState(false);

    const saveLightingPlan = useCallback<AsyncDispatch<StageLightingPlan>>(firstSaved ? 
        async (lp: StageLightingPlan) => {

            await renameLightingPlanIfNeeded(lightingPlan.name, lp.name);
            await updateLightingPlan(lp);

            setLightingPlan(lp);
        } :
        async (lp: StageLightingPlan) => {

            await createLightingPlan(lp);

            setFirstSaved(true);
            setLightingPlan(lp);
        },
    [firstSaved, lightingPlan])

    const renameValidation = useCallback(async (newName: string) => {
        const alreadyExists = await lightingPlanExists(newName);
        return !alreadyExists;
    }, []);

    const onRenameFail = useCallback((badName: string) =>{
        aleasToast.error(`Le plan de feu '${badName}' existe déjà.`)
    }, [])

    return <AleasMainLayout
        description="Nouveau plan de feu"
        requireAuth
        navbar
    >
        <LightingPlanEditor
            lightingPlan={lightingPlan}
            onMessage={aleasToast.info}
            saveLightingPlan={saveLightingPlan}
            canRename
            onRenameFail={onRenameFail}
            renameValidation={renameValidation}
        />
    </AleasMainLayout>
}

export default NewLightingPlanPage;