import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasDropdownButton, DropdownOption } from "@/components/aleas-components/aleas-dropdowns";
import AleasFoldableComponent from "@/components/aleas-components/aleas-foldable-component";
import AleasNumberInput from "@/components/aleas-components/aleas-number-input";
import AleasSlider from "@/components/aleas-components/aleas-slider";
import AleasTextField from "@/components/aleas-components/aleas-textfield";
import { updateLightingPlan } from "@/lib/services/api/show-control-api";
import { sorted } from "@/lib/services/core/arrays";
import { AsyncDipsatch } from "@/lib/services/core/types/utils";
import { mergeClasses, withValue } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { useShowControl } from "@/lib/services/dmx/showControl";
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
    const [modified, setModified] = useState<boolean>(false);
    const [working, setWorking] = useState<boolean>(false)


    useEffect(() => {
        const clone = structuredClone(lightingPlan);
        setWorkLightingPlan(clone);

        setModified(false);
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

        setModified(true);

    }, [lightingPlan])

    const save = async () => {
        if (workLightingPlan) {
            setWorking(true)
            await updateLightingPlan(workLightingPlan)

            setWorking(false);
            setModified(false);
        }
    }

    const reset = () => {
        const clone = structuredClone(lightingPlan);
        setWorkLightingPlan(clone);

        setModified(false)
    }

    const canSave = workLightingPlan !== undefined && modified;
    const canReset = workLightingPlan !== undefined && modified;

    return <div className={mergeClasses(
        "",
        "flex flex-col gap-6 w-full h-full overflow-y-auto justify-center items-stretch"
    )}>
        <div className="w-full text-center text-4xl">{workLightingPlan?.name}</div>
        <div className="flex flex-col gap-2 items-stretch justify-evenly">
            {orderedFixtures.map(fixture => <FixtureEdit
                key={`${fixture.key}-${fixture.id}`}
                fixture={fixture}
                updateFixture={async fixture => updateFixture(fixture.key, fixture)}
            />)}
        </div>
        <div className="flex flex-row gap-2 items-center justify-center">
            <AleasButton
                onClick={save}
                disabled={!canSave}
                spinning={working}
            >
                Sauvegarder
            </AleasButton>
            <AleasButton
                onClick={reset}
                disabled={!canReset}
                spinning={working}
            >
                Réinitialiser
            </AleasButton>
        </div>
    </div>
}

interface FixtureEditProps {
    fixture: Fixtures.Fixture;
    updateFixture: AsyncDipsatch<Fixtures.Fixture>;
}

const FixtureEdit = (props: FixtureEditProps) => {
    const {
        fixture,
        updateFixture
    } = props;

    const {
        name
    } = fixture;

    const {
        fixtureCollection
    } = useShowControl();

    const onAdressChanged = useCallback(async (address: number) => updateFixture(withValue(fixture, "address", address)), [fixture])

    const onNameChanged = useCallback(async (name: string) => updateFixture(withValue(fixture, "name", name)), [fixture])

    const onModelChanged = useCallback(async (model: string) => updateFixture(withValue(fixture, "model", model)), [fixture])

    const modelOptions: DropdownOption<string>[] = useMemo(() => ["test 1", "test 2"]
        .map(str => {
            return { 
                label: str,
                value: str
            }
        })
    ,
    [fixtureCollection])

    return <AleasFoldableComponent title={fixture.name}>
        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-3">
            <div>Nom :</div>
            <AleasTextField
                value={name}
                onValueChange={onNameChanged}
            />

            <div>Adresse :</div>
            <div className="w-full flex flex-row items-center justify-center gap-3">
                <AleasSlider
                    className="flex-grow"
                    value={fixture.address}
                    setValue={onAdressChanged}
                    orientation="horizontal"
                    min={1} max={512}
                />
                <AleasNumberInput
                    value={fixture.address}
                    onValueChange={onAdressChanged}
                    inputSize="Tiny"
                    min={1} max={512}
                />
            </div>

            <div>Modèle :</div>
            <AleasDropdownButton
                options={modelOptions}
                onSelectedOptionChanged={(option: DropdownOption<any>) => onModelChanged(option.value)}/>
        </div>
    </AleasFoldableComponent>
}

const WithinContext = (props: LightingPlanEditorProps) => <DndProvider backend={HTML5Backend}>
    <LightingPlanEditor {...props} />
</DndProvider>

export default WithinContext;



