import AleasFoldableComponent from "@/components/aleas-components/aleas-foldable-component";
import AleasNumberInput from "@/components/aleas-components/aleas-number-input";
import AleasSlider from "@/components/aleas-components/aleas-slider";
import { sorted } from "@/lib/services/core/arrays";
import { AsyncDipsatch } from "@/lib/services/core/types/utils";
import { mergeClasses, withValue } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export interface LightingPlanEditorProps {
    lightingPlan: StageLightingPlan;
}

const LightingPlanEditor = (props: LightingPlanEditorProps) => {

    const {
        lightingPlan
    } = props;

    const [workLightingPlan, setWorkLightingPlan] = useState<StageLightingPlan>();

    useEffect(() => {
        const clone = structuredClone(lightingPlan);
        setWorkLightingPlan(clone);
    }, [lightingPlan])

    const orderedFixtures = useMemo(() => workLightingPlan ?
        sorted(Object.values(workLightingPlan.fixtures), fixture => fixture.order ?? 0) :
        [], [workLightingPlan]);

    const updateFixture = useCallback(async (key: string, fixture: Fixtures.Fixture) => {
        if (!workLightingPlan) {
            return;
        }

        const newFixtures = {
            ...workLightingPlan.fixtures,
            [key]: fixture
        };

        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        // await updateLightingPlan(newLP);

    }, [lightingPlan])

    return <div className={mergeClasses(
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
    </div>
}

interface FixtureEditProps {
    fixture: Fixtures.Fixture;
    setFixture: AsyncDipsatch<Fixtures.Fixture>;
}

const FixtureEdit = (props: FixtureEditProps) => {
    const { fixture } = props;

    const onAdressChange = useCallback(async (address: number) => props.setFixture({ ...fixture, address }), [fixture])

    return <AleasFoldableComponent title={fixture.name}>
        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-3">
            <div>Adresse :</div>
            <div className="w-full flex flex-row items-center justify-center gap-3">
                <AleasSlider
                    className="flex-grow"
                    value={fixture.address}
                    setValue={onAdressChange}
                    orientation="horizontal"
                    min={1} max={512}
                />
                <AleasNumberInput
                    value={fixture.address}
                    onValueChange={onAdressChange}
                    inputSize="Tiny"
                    min={1} max={512}
                />
            </div>

            <div>Modèle</div>
        </div>
    </AleasFoldableComponent>
}

const WithinContext = (props: LightingPlanEditorProps) => <DndProvider backend={HTML5Backend}>
    <LightingPlanEditor {...props} />
</DndProvider>

export default WithinContext;