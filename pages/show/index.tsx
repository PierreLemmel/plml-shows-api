import { AleasIconButton } from "@/components/aleas-components/aleas-buttons";
import { AleasDropdownInput } from "@/components/aleas-components/aleas-dropdowns";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import { aleasToast } from "@/components/aleas-components/aleas-toast-container";
import useLocalStorage from "@/lib/services/api/local-storage";
import { deleteShow, listAllLightingPlans, listAllShowsInLightingPlan } from "@/lib/services/api/show-control-api";
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

    const [availableShows, setAvailableShows] = useState<string[]>([]);

    useEffectAsync(async () => {
        if (selectedLightingPlan) {
            const shows = await listAllShowsInLightingPlan(selectedLightingPlan);
            setAvailableShows(shows);
        }
        else {
            setAvailableShows([]);
        }
    }, [selectedLightingPlan]);

    const hasAvailableShows = availableShows.length > 0;

    return <AleasMainLayout
        title="Spectacles"
        titleDisplay
        description="Liste des spectacles"
        navbar
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
                    <Link href={pathCombine("show", selectedLightingPlan, "new-show")}>
                        <AleasIconButton icon={"New"}/>
                    </Link>
                </div>
                
                <div className="flex flex-col gap-3">
                    {hasAvailableShows ? 
                        availableShows.map(show => <ShowLine key={show} show={show} lightingPlan={selectedLightingPlan} />) :
                    <div>Aucun spectacle à afficher pour l&apos;instant</div>}
                </div>
            </div>}
            
        </div>
    </AleasMainLayout>
}

type ShowLineProps = {
    show: string;
    lightingPlan: string;
}

const ShowLine = (props: ShowLineProps) => {

    const {
        show,
        lightingPlan
    } = props;

    const onDeleteShow = useCallback(async () => {
        await deleteShow(lightingPlan, show);
        aleasToast.info(`Spectacle '${show}' supprimé`)
    }, [lightingPlan, show])

    return <div key={show} className="flex flex-row items-center gap-2">
        <div>{show}</div>
        <Link href={pathCombine("show", lightingPlan, show)}>
            <AleasIconButton icon="Edit" />
        </Link>
        <AleasIconButton
            icon="Delete"
            hasConfirmation
            confirmationOptions={{
                title: "Suppression",
                message: "Êtes-vous sûr de vouloir supprimer ce spectacle ?"
            }}
            onClick={onDeleteShow}
        />
    </div>
}

export default ShowPage;