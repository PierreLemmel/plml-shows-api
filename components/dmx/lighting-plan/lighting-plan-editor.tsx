import { AleasButton, AleasIconButton } from "@/components/aleas-components/aleas-buttons";
import { AleasDropdownButton, DropdownOption } from "@/components/aleas-components/aleas-dropdowns";
import AleasFoldableComponent from "@/components/aleas-components/aleas-foldable-component";
import AleasNumberInput from "@/components/aleas-components/aleas-number-input";
import { AleasPopoverTextInput } from "@/components/aleas-components/aleas-popover-inputs";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import AleasSlider from "@/components/aleas-components/aleas-slider";
import { arrayMove, excludeIndex, insertAt } from "@/lib/services/core/arrays";
import { AsyncDispatch } from "@/lib/services/core/types/utils";
import { doNothing, doNothingAsync, generateId, incrementId, mergeClasses, mergeConditions, simplyReturn, withValue, withValues } from "@/lib/services/core/utils";
import { Validators } from "@/lib/services/core/validation";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { FixtureModelInfo, LedFixtureModelInfo, listFixtureModels, useFixtureCollectionInfo, useFixtureInfo } from "@/lib/services/dmx/showControl";
import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export type LightingPlanEditorProps = {
    lightingPlan: StageLightingPlan;
    onMessage?: Dispatch<string>;
    saveLightingPlan: AsyncDispatch<StageLightingPlan>;
} & ({
    canRename?: false;
    renameValidation?: never;
    onRename?: never;
    onRenameFail?: never;
} | {
    canRename: true;
    renameValidation?: (newName: string) => Promise<boolean>;
    onRename?: Dispatch<string>;
    onRenameFail?: Dispatch<string>;
})

const LightingPlanEditor = (props: LightingPlanEditorProps) => {

    const {
        lightingPlan,
        onMessage = doNothing,
        saveLightingPlan,
        canRename,
        renameValidation = simplyReturn(true),
        onRename = doNothing,
        onRenameFail = doNothing
    } = props;

    const [workLightingPlan, setWorkLightingPlan] = useState<StageLightingPlan>();
    const [modified, setModified] = useState<boolean>(false);
    const [working, setWorking] = useState<boolean>(false);

    
    useEffect(() => {
        const clone = structuredClone(lightingPlan);
        setWorkLightingPlan(clone);
        
        setModified(false);
    }, [lightingPlan])
    
    const workFixtures = workLightingPlan?.fixtures ?? [];
    const swappedFixtures = workFixtures.map((fixture, i) => ({
        fixture,
        i
    }));
    
    const [swapIndexes, setSwapIndexes] = useState<{ from: number, to: number }|null>(null);
    if (swapIndexes) {
        const { from, to } = swapIndexes;
        arrayMove(swappedFixtures, from, to);
    }

    const onFixtureDrop = useCallback(() => {
        if (!workLightingPlan || !swapIndexes) {
            return;
        }

        const { from, to } = swapIndexes;
        
        if (from !== to) {
            const newFixtures = [...workLightingPlan.fixtures];
            arrayMove(newFixtures, from, to);

            const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
            setWorkLightingPlan(newLP);

            setModified(true);
        }

        setSwapIndexes(null);
    }, [workLightingPlan, swapIndexes]);

    const onFixtureDragHover = useCallback((from: number, to: number) => {
        
        setSwapIndexes({ from, to });
    }, [workLightingPlan]);

    const idAlreadyUsed = useCallback((index: number) => ((id: string) => {
        if (!workLightingPlan) {
            return false;
        }

        const used = workLightingPlan.fixtures.some((f, i) => f.key === id && i !== index);
        return used;
    }), [workLightingPlan])

    const updateFixture = useCallback(async (index: number, fixture: Fixtures.Fixture) => {
        if (!workLightingPlan) {
            return;
        }

        const newFixtures = [
            ...workLightingPlan.fixtures,
        ];
        newFixtures[index] = fixture;

        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        setModified(true);

    }, [workLightingPlan])

    const deleteFixture = useCallback(async (index: number) => {
        if (!workLightingPlan) {
            return;
        }

        const newFixtures = excludeIndex(workLightingPlan.fixtures, index);

        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        setModified(true);
    }, [workLightingPlan])

    const duplicateFixture = useCallback(async (index: number, fixture: Fixtures.Fixture) => {

        if (!workLightingPlan) {
            return;
        }

        const newId = generateId();

        let newKey = incrementId(fixture.key);

        const checkIfExists = idAlreadyUsed(-1);
        while (checkIfExists(newKey)) {
            newKey = incrementId(newKey);
        }

        const newFixture: Fixtures.Fixture = {
            ...fixture,
            name: `${fixture.name} (copie)`,
            id: newId,
            key: incrementId(fixture.key),
        }

        const newFixtures = insertAt(workLightingPlan.fixtures, index + 1, newFixture);
        
        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        setModified(true);

    }, [workLightingPlan])

    const addNewFixture = useCallback(async () => {
        
        if (!workLightingPlan) {
            return;
        }

        const id = generateId();
        const key = generateId({ type: "LettersOnly" });
        const newFixture: Fixtures.Fixture = {
            id,
            key,
            address: 1,
            name: "Nouveau projecteur",
            model: "generic",
        }

        const newFixtures = [
            ...workLightingPlan.fixtures,
            newFixture
        ];        

        const newLP = withValue(workLightingPlan, "fixtures", newFixtures);
        setWorkLightingPlan(newLP);

        setModified(true);
    }, [workLightingPlan]);

    const onLpRename = useCallback(async (newName: string) => {

        if (!workLightingPlan) {
            return;
        }

        const canRename = await renameValidation(newName);
        if (canRename) {
            const newLP = withValue(workLightingPlan, "name", newName);
            setWorkLightingPlan(newLP);
            setModified(true);

            onRename(newName);
        }
        else {
            onRenameFail(newName);
        }

    }, [workLightingPlan, onRename])

    const save = async () => {
        if (workLightingPlan) {
            setWorking(true)
            await saveLightingPlan(workLightingPlan)

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

    const lpName = workLightingPlan?.name ?? "";
    const [editingName, setEditingName] = useState<boolean>(false);

    return <div
        className={mergeClasses(
            "flex flex-col gap-6 w-full h-full overflow-y-auto justify-start items-stretch",
        )}
    >
        <div className={mergeClasses(
            "w-full text-center text-4xl",
            canRename && "flex flex-row gap-2 items-center justify-center"
        )}>
            <div>{workLightingPlan?.name}</div>
            {canRename && <AleasIconButton
                icon="Edit"
                size="Small"
                className="flex-grow-0"
                onClick={() => setEditingName(true)}
            />}
        </div>
        {canRename && <AleasPopoverTextInput
            isOpen={editingName}
            onCancel={() => setEditingName(false)}
            onConfirm={async (value: string) => {
                await onLpRename(value);
                setEditingName(false);
            }}
            title="Renommer"
            initialValue={lpName}
            canValidate={Validators.strings.lengthBetween(3, 50)}
        >
            Indiquer un nouveau nom (entre 3 et 50 caractères)
        </AleasPopoverTextInput>}
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
            {swappedFixtures.map((fixtureWithIndex) => {

                const {
                    fixture,
                    i
                } = fixtureWithIndex;

                return <FixtureEdit
                    index={i}
                    key={`Fixture-${fixture.key}-${i}`}
                    fixture={fixture}
                    updateFixture={async (fixture) => await updateFixture(i, fixture)}
                    deleteFixture={async (fixture) => await deleteFixture(i)}
                    duplicateFixture={async (fixture) => await duplicateFixture(i, fixture)}
                    idAlreadyUsed={idAlreadyUsed(i)}

                    onDrop={() => onFixtureDrop()}
                    onDraggedHover={(draggedItem: number) => onFixtureDragHover(i, draggedItem)}
                />;
            })}
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
                hasConfirmation={true}
                confirmationOptions={{
                    title: "Réinitialiser",
                    message: "Êtes-vous sûr de vouloir réinitialiser le plan de feu ?"
                }}
                onClick={reset}
                disabled={!canReset}
                spinning={working}
            >
                Réinitialiser
            </AleasButton>
        </div>
    </div>
}

enum ItemTypes {
    Fixture = "Fixture",
} 

interface DndDragObject {
    id: string;
    index: number;
}

interface DragCollectedProps {
    isDragging: boolean;
}

interface DropCollectedProps {

}

interface FixtureEditProps {
    index: number;

    fixture: Fixtures.Fixture;
    updateFixture: AsyncDispatch<Fixtures.Fixture>;
    deleteFixture: AsyncDispatch<Fixtures.Fixture>;
    duplicateFixture: AsyncDispatch<Fixtures.Fixture>;
    idAlreadyUsed: (name: string) => boolean;

    onDrop: () => void;
    onDraggedHover: (draggedItem: number) => void;
}

const FixtureEdit = (props: FixtureEditProps) => {
    const {
        index,

        fixture,
        updateFixture,
        deleteFixture,
        duplicateFixture,
        idAlreadyUsed,

        onDrop,
        onDraggedHover,
    } = props;

    const [
        { isDragging },
        drag
    ] = useDrag<DndDragObject, void, DragCollectedProps>({
        type: ItemTypes.Fixture,
        item: {
            id: fixture.id,
            index
        },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => !editingName && !editingKey,
        end: onDrop
    })


    const dndRef = useRef<HTMLDivElement>(null)
    const [ , drop] = useDrop<
        DndDragObject,
        void,
        DropCollectedProps
    >({
        accept: ItemTypes.Fixture,
        collect: monitor => {
            return {
                handlerId: monitor.getHandlerId()
            }
        },
        hover: (item, monitor) => {
            if (!dndRef.current) {
                return;
            }

            const draggedIndex = item.index
            const hoverIndex = index

            if (draggedIndex === hoverIndex) {
                return;
            }

            const hoverBoundingRect = dndRef.current?.getBoundingClientRect()
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const clientOffset = monitor.getClientOffset()
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top

            if (draggedIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            if (draggedIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            onDraggedHover(draggedIndex);
        },
    })


    const fixtureCollection = useFixtureCollectionInfo();
    const fixtureInfo = useFixtureInfo(fixture, index);

    const onAdressChanged = async (address: number) => updateFixture(withValue(fixture, "address", address))
    const onNameChanged = async (name: string) => updateFixture(withValue(fixture, "name", name))
    const onModeChanged = async (mode: number) => updateFixture(withValue(fixture, "mode", mode));
    const onKeyChanged = async (newKey: string) => updateFixture(withValue(fixture, "key", newKey));

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

    const modelOptions: DropdownOption<FixtureModelInfo>[] = useMemo(() => {
        if (!fixtureCollection) {
            return []
        }

        const result = listFixtureModels(fixtureCollection)
            .sort((a, b) => a.name.localeCompare(b.name))
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

        drag(drop(dndRef));
        return <div ref={dndRef} className={isDragging ? "bg-slate-400/20 rounded-md" : undefined}>
            <div className={isDragging ? "opacity-25" : undefined}> 
                <AleasFoldableComponent title={name}>
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
                            <AleasPopoverTextInput
                                isOpen={editingName}
                                onCancel={() => setEditingName(false)}
                                onConfirm={(value: string) => {
                                    onNameChanged(value);
                                    setEditingName(false);
                                }}
                                title="Renommer"
                                initialValue={name}
                                canValidate={Validators.strings.lengthBetween(3, 50)}
                            >
                                Indiquer un nouveau nom (entre 3 et 50 caractères)
                            </AleasPopoverTextInput>
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
                                    onClick={() => setEditingKey(true)}
                                />
                            </div>
                            <AleasPopoverTextInput
                                isOpen={editingKey}
                                onCancel={() => setEditingKey(false)}
                                onConfirm={(newKey: string) => {
                                    onKeyChanged(newKey);
                                    setEditingKey(false);
                                }}
                                title="Renommer"
                                initialValue={key}
                                canValidate={mergeConditions(
                                    Validators.strings.regex(/^[a-zA-Z]([a-zA-Z0-9_\-]){2,11}$/),
                                    id => !idAlreadyUsed(id)
                                )}
                            >
                                L&apos;identifiant doit être unique, commencer par une lettre et contenir entre 3 et 12 caractères alphanumériques, tirets et underscores
                            </AleasPopoverTextInput>
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
                                hasConfirmation={true}
                                confirmationOptions={{
                                    title: "Supprimer",
                                    message: "Êtes-vous sûr de vouloir supprimer cet appareil ?",
                                }}
                                className="px-5"
                                size="Small"
                                onClick={async () => await deleteFixture(fixture)}
                            >
                                Supprimer
                            </AleasButton>
                        </div>
                    </div>
                </AleasFoldableComponent>
            </div>
        </div>
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