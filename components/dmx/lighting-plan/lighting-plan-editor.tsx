import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasDropdownButton, DropdownOption } from "@/components/aleas-components/aleas-dropdowns";
import AleasFoldableComponent from "@/components/aleas-components/aleas-foldable-component";
import AleasNumberInput from "@/components/aleas-components/aleas-number-input";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import AleasSlider from "@/components/aleas-components/aleas-slider";
import AleasTextField from "@/components/aleas-components/aleas-textfield";
import { updateLightingPlan } from "@/lib/services/api/show-control-api";
import { sorted } from "@/lib/services/core/arrays";
import { AsyncDipsatch } from "@/lib/services/core/types/utils";
import { mergeClasses, withValue, withValues } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { FixtureModelInfo, LedFixtureModelInfo, listFixtureModels, TradFixtureModelInfo, useFixtureCollectionInfo, useFixtureInfo } from "@/lib/services/dmx/showControl";
import { use, useCallback, useEffect, useMemo, useState } from "react";
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

    }, [workLightingPlan])

    const deleteFixture = useCallback(async (key: string) => {
        if (!workLightingPlan) {
            return;
        }

        const newFixtures = {
            ...workLightingPlan.fixtures,
        };

        delete newFixtures[key];

        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        setModified(true);
    }, [workLightingPlan])

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
        "flex flex-col gap-6 w-full h-full overflow-y-auto justify-start items-stretch",
    )}>
        <div className="w-full text-center text-4xl">{workLightingPlan?.name}</div>
        <div className="flex flex-col gap-2 items-stretch justify-evenly">
            {orderedFixtures.map(fixture => <FixtureEdit
                key={`${fixture.key}-${fixture.id}`}
                fixture={fixture}
                updateFixture={async fixture => updateFixture(fixture.key, fixture)}
                deleteFixture={async fixture => deleteFixture(fixture.key)}
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
    deleteFixture: AsyncDipsatch<Fixtures.Fixture>;
}

const FixtureEdit = (props: FixtureEditProps) => {
    const {
        fixture,
        updateFixture,
    } = props;

    const fixtureCollection = useFixtureCollectionInfo();
    const fixtureInfo = useFixtureInfo(fixture);

    const onAdressChanged = async (address: number) => updateFixture(withValue(fixture, "address", address))

    const onNameChanged = async (name: string) => updateFixture(withValue(fixture, "name", name))

    const onModelChanged = async (data: {
        model: string,
        mode?: number
    }) => {
        const { model, mode } = data;
        return updateFixture(withValues(fixture, {
            "model": model,
            "mode": mode
        }));
    }

    const onModeChanged = async (mode: number) => updateFixture(withValue(fixture, "mode", mode))

    const modelOptions: DropdownOption<FixtureModelInfo>[] = useMemo(() => {
        if (!fixtureCollection) {
            return []
        }

        const result = listFixtureModels(fixtureCollection)
            .map(model => ({
                label: model.name,
                value: model
            }));

        return result;
    },
    [fixtureCollection])

    const modeOptions = useMemo<DropdownOption<number>[]>(() => {

        if (fixtureInfo) {
            const modes: DropdownOption<number>[] = getValueAccordingToModelType<number[]>(fixtureInfo.model, modes => modes, [])
                .map(mode => ({
                    label: mode.toString(),
                    value: mode
                }));
            return modes;
        }
        else {
            return [];
        }

    }, [fixtureInfo]);

    const onModelOptionSelected = useCallback((newModel: FixtureModelInfo) => {
        
        const shortName = newModel.shortName;

        const mode: number|undefined = getValueAccordingToModelType(newModel, modes => Math.min(...modes), undefined)

        onModelChanged({ model: shortName, mode });
    }, [])

    if (fixtureInfo) {

        const {
            name,
            model,
            mode
        } = fixtureInfo;

        return <AleasFoldableComponent title={name}>
            <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-6 gap-y-3 items-center">
                <FixtureEditLabel>Nom :</FixtureEditLabel>
                <AleasTextField
                    value={name}
                    onValueChange={onNameChanged}
                />

                <FixtureEditLabel>Adresse :</FixtureEditLabel>
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

                <FixtureEditLabel>Modèle :</FixtureEditLabel>
                <AleasDropdownButton
                    options={modelOptions}
                    value={model}
                    onValueChanged={onModelOptionSelected}
                    idFunction={(model?: FixtureModelInfo) => model?.shortName}
                    size="Small"
                />

                {mode ? <>
                    <FixtureEditLabel>Mode :</FixtureEditLabel>
                    <AleasDropdownButton
                        options={modeOptions}
                        value={mode}
                        onValueChanged={onModeChanged}
                        size="Small"
                    />
                    <div>{mode}</div>
                </> : <div className="col-span-2"></div>}
            </div>
        </AleasFoldableComponent>
    } 
    else {
        return <AleasSkeletonLoader lines={1} />
    }
}

function getValueAccordingToModelType<T>(model: FixtureModelInfo, valueOnLeds: (modes: number[]) => T, valueOnTrad: T) {
    const {
        shortName,
        type
    } = model;

    if (Fixtures.isLed(type)) {
        const ledModel = model as LedFixtureModelInfo;
        const chanCounts = Object
            .keys(ledModel.modes)
            .map(k => Number.parseInt(k));

        if (chanCounts.length === 0) {
            throw `Fixture model '${shortName}' has no mode`;
        }

        const result: T = valueOnLeds(chanCounts);
        return result;
    }
    else if (Fixtures.isTrad(type)){
        return valueOnTrad;
    }
    else {
        throw `Fixture model '${shortName}' has unexpected type '${type}'`;
    }
}

const WithinContext = (props: LightingPlanEditorProps) => <DndProvider backend={HTML5Backend}>
    <LightingPlanEditor {...props} />
</DndProvider>

const FixtureEditLabel = ({ children }: { children: string }) => <div className="flex flex-row items-center justify-end">{children}</div>

export default WithinContext;