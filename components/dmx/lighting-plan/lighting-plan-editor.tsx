import { AleasButton, AleasIconButton } from "@/components/aleas-components/aleas-buttons";
import { AleasDropdownButton, DropdownOption } from "@/components/aleas-components/aleas-dropdowns";
import AleasFoldableComponent from "@/components/aleas-components/aleas-foldable-component";
import AleasModalDialog from "@/components/aleas-components/aleas-modal-dialog";
import AleasNumberInput from "@/components/aleas-components/aleas-number-input";
import AleasPopoverTextInput from "@/components/aleas-components/aleas-popover-textfield";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import AleasSlider from "@/components/aleas-components/aleas-slider";
import AleasTextField from "@/components/aleas-components/aleas-textfield";
import { updateLightingPlan } from "@/lib/services/api/show-control-api";
import { sorted } from "@/lib/services/core/arrays";
import { AsyncDispatch } from "@/lib/services/core/types/utils";
import { generateId, mergeClasses, withValue, withValues } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { FixtureModelInfo, LedFixtureModelInfo, listFixtureModels, TradFixtureModelInfo, useFixtureCollectionInfo, useFixtureInfo } from "@/lib/services/dmx/showControl";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export interface LightingPlanEditorProps {
    lightingPlan: StageLightingPlan;
    onMessage: (message: string) => void;
}

const LightingPlanEditor = (props: LightingPlanEditorProps) => {

    const {
        lightingPlan,
        onMessage
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
        sorted(Object.values(workLightingPlan.fixtures), fixture => fixture.order) :
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

    const duplicateFixture = useCallback(async (key: string, fixture: Fixtures.Fixture) => {

        if (!workLightingPlan) {
            return;
        }

        const newId = generateId();

        const newFixture: Fixtures.Fixture = {
            ...fixture,
            name: `${fixture.name} (copie)`,
            id: newId,
            key: newId,
        }

        const newFixtures = {
            ...workLightingPlan.fixtures,
            [newId]: newFixture
        }
        
        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        setModified(true);

    }, [workLightingPlan])

    const changeKeyForFixture = useCallback(async (oldKey: string, newKey: string) => {
        if (!workLightingPlan) {
            return;
        }

        const oldFixtures = workLightingPlan.fixtures;

        const newFixtures = {
            ...oldFixtures,
            [newKey]: oldFixtures[oldKey]
        };

        delete newFixtures[oldKey];

        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        setModified(true);
    }, [workLightingPlan])

    const addNewFixture = useCallback(async () => {
        
        if (!workLightingPlan) {
            return;
        }

        const id = generateId();
        const newFixture: Fixtures.Fixture = {
            id,
            key: id,
            address: 1,
            name: "Nouveau projecteur",
            model: "generic",
            order: Object.keys(workLightingPlan.fixtures).length + 1
        }

        const newFixtures = {
            ...workLightingPlan.fixtures,
            [id]: newFixture
        };

        

        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        setModified(true);
    }, [workLightingPlan]);

    const save = async () => {
        if (workLightingPlan) {
            setWorking(true)
            await updateLightingPlan(workLightingPlan)

            setWorking(false);
            setModified(false);

            onMessage("Plan de feu sauvegardé");
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
        <div className="flex flex-row justify-end pr-1">
            <AleasButton
                size="Small"
                className="px-3 py-1"
                onClick={async () => await addNewFixture()}
            >
                Ajouter un appareil
            </AleasButton>
        </div>
        <div className="flex flex-col gap-2 items-stretch justify-evenly">
            {orderedFixtures.map(fixture => <FixtureEdit
                key={`${fixture.key}-${fixture.id}`}
                fixture={fixture}
                updateFixture={async fixture => await updateFixture(fixture.key, fixture)}
                deleteFixture={async fixture => await deleteFixture(fixture.key)}
                duplicateFixture={async fixture => await duplicateFixture(fixture.key, fixture)}
                changeKeyForFixture={async (oldKey: string, newKey: string) => await changeKeyForFixture(oldKey, newKey)}
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
    updateFixture: AsyncDispatch<Fixtures.Fixture>;
    deleteFixture: AsyncDispatch<Fixtures.Fixture>;
    duplicateFixture: AsyncDispatch<Fixtures.Fixture>;
    changeKeyForFixture: (oldKey: string, newKey: string) => Promise<void>;
}

const FixtureEdit = (props: FixtureEditProps) => {
    const {
        fixture,
        updateFixture,
        deleteFixture,
        duplicateFixture,
        changeKeyForFixture
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

    const [editingName, setEditingName] = useState<boolean>(false);
    const [editingKey, setEditingKey] = useState<boolean>(false);

    if (fixtureInfo) {

        const {
            name,
            key,
            model,
            mode
        } = fixtureInfo;

        return <AleasFoldableComponent title={name}>
            <div className="flex flex-col w-full gap-6">
                <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-6 gap-y-3 items-center">
                    <FixtureEditLabel>Nom :</FixtureEditLabel>
                    <div className="flex flex-row w-full items-center">
                        <div className="flex-grow">{name}</div>
                        <AleasIconButton
                            icon="Edit"
                            size="Small"
                            className="flex-grow-0"
                            onClick={() => setEditingName(true)}
                        />
                    </div>
                    <AleasModalDialog isOpen={editingName}>TEST</AleasModalDialog>
                    {/* {editingName && <AleasPopoverTextInput
                        title="Renommer l'appareil"
                        onCancel={() => setEditingName(false)}
                        onConfirm={onNameChanged}
                    />} */}

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
                    </> : <div className="col-span-2"></div>}

                    <FixtureEditLabel>Identifiant :</FixtureEditLabel>
                    <div className="flex flex-row w-full items-center">
                        <div className="flex-grow">{key}</div>
                        <AleasIconButton
                            icon="Edit"
                            size="Small"
                            className="flex-grow-0"
                        />
                    </div>

                </div>
                <div className="w-full flex flex-row gap-3 items-center justify-center">
                    <AleasButton
                        className="px-5"
                        size="Small"
                        onClick={async () => await duplicateFixture(fixture)}
                    >
                        Dupliquer
                    </AleasButton>
                    <AleasButton
                        className="px-5"
                        size="Small"
                        onClick={async () => await deleteFixture(fixture)}
                    >
                        Supprimer
                    </AleasButton>
                </div>
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