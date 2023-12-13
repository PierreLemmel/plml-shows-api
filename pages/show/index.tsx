import { AleasIconButton } from "@/components/aleas-components/aleas-buttons";
import { AleasDropdownInput } from "@/components/aleas-components/aleas-dropdowns";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import useLocalStorage from "@/lib/services/api/local-storage";
import { listAllLightingPlans } from "@/lib/services/api/show-control-api";
import { pathCombine } from "@/lib/services/core/files";
import { useEffectAsync } from "@/lib/services/core/hooks";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const ShowPage = () => {

    const [lightingPlans, setLightingPlans] = useState<string[]>([]);
    const hasLightingPlans = lightingPlans.length > 0;

    useEffectAsync(async () => {
        const lps = await listAllLightingPlans();
        setLightingPlans(lps);
    }, []);

    const [storedLPSelection, setStoredLPSelection] = useLocalStorage<string>("show-index/selected-lp", "");

    const [selectedLightingPlan, setSelectedLightingPlan] = useState<string>();
    const hasSelectedLightingPlan = selectedLightingPlan !== undefined;

    useEffect(() => {
        if (storedLPSelection !== "" && lightingPlans.includes(storedLPSelection)) {
            setSelectedLightingPlan(storedLPSelection);
        }
    }, [storedLPSelection, lightingPlans]);

    useEffect(() => {
        if (selectedLightingPlan && selectedLightingPlan !== storedLPSelection) {
            setStoredLPSelection(selectedLightingPlan);
        }
    }, [selectedLightingPlan]);

    const lpOptions = useMemo(
        () => lightingPlans.map(lp => ({ label: lp, value: lp })),
        [lightingPlans]
    );


    return <AleasMainLayout
        title="Spectacles"
        titleDisplay
        description="Liste des spectacles"
        navbar
        toasts
        requireAuth
    >
        <div className="flex flex-col w-full items-center gap-6">
            {/* Lighting plan selection */}
            <div className="flex flex-row items-center gap-2 justify-start">
                {
                    hasLightingPlans ? <>
                        <div>
                            Plan&nbsp;de&nbsp;feu&nbsp;:
                        </div>
                        <AleasDropdownInput
                            placeholder="Sélectionnez un plan de feu"
                            className=""
                            options={lpOptions}
                            value={selectedLightingPlan}
                            onValueChanged={(newLp: string) => setSelectedLightingPlan(newLp)}
                        />
                        <Link href={hasSelectedLightingPlan ? pathCombine("dmx", "lighting-plan", selectedLightingPlan, "edit") : ""}>
                            <AleasIconButton disabled={!hasSelectedLightingPlan} icon={"Edit"} />
                        </Link>
                    </> :
                    <div>Aucun plan de feu pour l&apos;instant</div>
                }

                <Link href={pathCombine("dmx", "lighting-plan", "new")}>
                    <AleasIconButton icon={"New"} />
                </Link>
            </div>

            {/* Show list */}
            {selectedLightingPlan && <div className="flex flex-col w-full items-stretch">
                <div className="flex flex-row justify-between">
                    <div className="font-bold text-2xl">Spectacles :</div>
                    <AleasIconButton icon={"New"}/>
                </div>
            </div>}
            
        </div>
    </AleasMainLayout>
}

export default ShowPage;