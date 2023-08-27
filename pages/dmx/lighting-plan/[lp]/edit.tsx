import AleasFoldableComponent from "@/components/aleas/aleas-foldable-component";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import AleasSlider from "@/components/aleas/aleas-slider";
import { renameDocument } from "@/lib/services/api/firebase";
import { getLightingPlan, updateLightingPlan } from "@/lib/services/api/show-control-api";
import { sorted } from "@/lib/services/core/arrays";
import { pathCombine } from "@/lib/services/core/files";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { AsyncDipsatch } from "@/lib/services/core/types/utils";
import { mergeClasses, withValue } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { useRouter } from "next/router";
import { Dispatch, useCallback, useMemo, useState } from "react";

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
        title={lpName || "Lighting Plan Edit"}
        description={`Lighting Plan Edit - ${lpName}`}
        toasts
        requireAuth
        navbar
    >
        {lightingPlan ? <div className={mergeClasses(
            "",
            "flex flex-col gap-3 w-full h-full overflow-y-auto justify-center items-stretch"
        )}>
            <div className="flex flex-col gap-2 items-stretch justify-evenly">
                {orderedFixtures.map(fixture => <FixtureEdit
                    key={`${fixture.name}-${fixture.id}`}
                    fixture={fixture}
                    setFixture={async fixture => updateFixture(fixture.key, fixture)}
                />)}
            </div>
        </div> :
        <AleasSkeletonLoader lines={8} />}
    </AleasMainLayout>
}

interface FixtureEditProps {
    fixture: Fixtures.Fixture;
    setFixture: AsyncDipsatch<Fixtures.Fixture>;
}

const FixtureEdit = (props: FixtureEditProps) => {
    const { fixture } = props;

    return <AleasFoldableComponent title={fixture.name}>
        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-3">
            <div>Adresse :</div>
            <div className="w-full flex flex-row items-center justify-center gap-3">
                <AleasSlider
                    className="flex-grow"
                    value={fixture.address}
                    setValue={async (address) => props.setFixture({ ...fixture, address })}
                    orientation="horizontal"
                    min={1} max={512}
                />
                <div className="min-w-[2.5em]">{fixture.address}</div>
            </div>

            <div>Modèle</div>
        </div>
    </AleasFoldableComponent>
}

export default LightingPlanEdit;