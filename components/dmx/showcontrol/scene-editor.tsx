import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import AleasCheckbox from "@/components/aleas-components/aleas-checkbox";
import AleasColorPicker from "@/components/aleas-components/aleas-color-picker";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import AleasSlider from "@/components/aleas-components/aleas-slider";
import { replaceFirstElement, sorted } from "@/lib/services/core/arrays";
import { Color, RgbColor } from "@/lib/services/core/types/rgbColor";
import { Action, AsyncDispatch } from "@/lib/services/core/types/utils";
import { doNothing, mergeClasses, withValue } from "@/lib/services/core/utils";
import { Chans } from "@/lib/services/dmx/dmx512";
import { initializeValuesForChannels, FixtureInfo, orderedFixtures, Scene, SceneElement, SceneElementInfo, SceneElementValues, Show, toScene, useLightingPlanInfo, useRealtimeScene, useSceneInfo } from "@/lib/services/dmx/showControl";
import { on } from "events";
import { Dispatch, Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export interface SceneEditorProps {
    show: Show;
    scene: Scene;
    onSave: AsyncDispatch<Scene>;
    onFinished: Action;
}

enum ItemTypes {
    SECard = "SceneElementCard",
    LPCard = "LightingPlanCard",
    SEColumn = "SceneElementColumn",
} 

const SceneEditor = (props: SceneEditorProps) => {
    const {
        scene,
        onSave,
        onFinished,
    } = props;

    const lightingPlan = useLightingPlanInfo();

    const [workScene, setWorkScene] = useState<Scene>(structuredClone(scene));
    useEffect(() => {
        if (scene) {
            const clone = structuredClone(scene);
            setWorkScene(clone)
        }
    }, [scene])

    const sceneInfo = useSceneInfo(workScene);

    const onFixtureAdded = useCallback((fixture: FixtureInfo) => {

        const {
            channels,
            key: fixtureKey
        } = fixture;

        const seValues = initializeValuesForChannels(channels);

        const newSceneElement: SceneElement = {
            fixture: fixtureKey,
            values: seValues,
        }

        const updated = [...workScene.elements, newSceneElement];
        setWorkScene({
            ...workScene,
            elements: updated,
        });
    }, [workScene]);

    const [ , sceneDropZone] = useDrop<DndDragObject>({
        accept: [
            ItemTypes.LPCard,
            ItemTypes.SECard,
        ],
        drop: (item) => onFixtureAdded(item.fixture),
        collect: monitor => monitor.isOver(),
    })

    const applyEnabled = workScene !== undefined;
    const [isSaving, setIsSaving] = useState(false);
    const onApplyClicked = async () => {
        setIsSaving(true);
        await onSave(workScene);
        setIsSaving(false);
    }

    const onSceneElementValueChanged = useCallback((element: SceneElementInfo) => {
        if (!sceneInfo) {
            return;
        }

        const updatedElements = replaceFirstElement(sceneInfo.elements, sei => sei.fixture.id === element.fixture.id, element);

        const updatedSI = withValue(sceneInfo, "elements", updatedElements);
        const updatedScene = toScene(updatedSI);

        setWorkScene(updatedScene);
    }, [workScene, sceneInfo]);

    const onMultipleEditValueChanged = useCallback((newElements: SceneElementInfo[]) => {
        if (!sceneInfo) {
            return;
        }

        const updatedElements = structuredClone(sceneInfo.elements);

        newElements.forEach(newElement => {
            const index = updatedElements.findIndex(sei => sei.fixture.id === newElement.fixture.id);
            if (index !== -1) {
                updatedElements[index] = structuredClone(newElement);
            }
        });

        const updatedSI = withValue(sceneInfo, "elements", updatedElements);
        const updatedScene = toScene(updatedSI);

        setWorkScene(updatedScene);

    }, [workScene, sceneInfo]);

    const onSceneElementRemoved = useCallback((element: SceneElementInfo) => {
        if (!sceneInfo) {
            return;
        }

        const { elements } = sceneInfo;
        const remaining = elements
            .filter(se => se.fixture.id !== element.fixture.id);

        const updatedSI = withValue(sceneInfo, "elements", remaining);
        const updatedScene = toScene(updatedSI);

        setWorkScene(updatedScene);
        
    }, [workScene, sceneInfo])

    const [playScene, setPlayScene] = useState(false);

    const workSI = useSceneInfo(workScene);
    const track = useRealtimeScene(workSI, playScene);
    const playEnabled = workScene !== undefined && track !== undefined;

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const orderedIncludedFixtures = useMemo(
        () => sceneInfo ? sorted(sceneInfo.elements, si => si.fixture.order) : [],
        [sceneInfo]
    );

    const selectedFixtures = useMemo(() => {
        return orderedIncludedFixtures.filter(element => selectedKeys.has(element.fixture.id));
    },
    [selectedKeys, orderedIncludedFixtures])

    return <div className={mergeClasses(
        "full flex flex-col items-stretch justify-between gap-8",
    )}>
        <div className="flex-grow h-full relative">
            <div className="absolute top-0 left-0 bottom-0 right-0 grid grid-cols-2 gap-6">

                {/* LP Column */}
                <div className={mergeClasses(
                    "w-full h-full flex flex-col items-stretch gap-4",
                    "bg-slate-700/80 px-3 py-2 rounded-lg",
                    "overflow-y-auto",
                )}>
                    <div className="text-xl text-center">Plan de feu</div>
                    {lightingPlan && workScene ?
                        <div className={mergeClasses(
                            "w-full flex flex-col items-stretch gap-2",
                        )}>
                            {orderedFixtures(lightingPlan).map(fixture => {
                                const enabled = workScene.elements.find(se => se.fixture === fixture.key) === undefined;

                                return <LPFixtureCard
                                    key={fixture.id}
                                    fixture={fixture}
                                    enabled={enabled}
                                    onAddClicked={onFixtureAdded}
                                />;
                            })}
                        </div> :
                        <AleasSkeletonLoader lines={5} />}
                </div>

                {/* Scene Column */}
                <div className={mergeClasses(
                    "w-full h-full flex flex-col items-stretch gap-4",
                    "bg-slate-700/80 px-3 py-2 rounded-lg overflow-y-auto",
                )}>
                    {(workScene && sceneInfo) ? <>
                        <div className="text-xl text-center">{sceneInfo.name}</div>
                        <div
                            ref={sceneDropZone}
                            className={mergeClasses(
                                "w-full flex-grow overflow-y-auto",
                                "flex flex-col items-stretch gap-6",
                        )}>
                            <div className="w-full gap-2 flex flex-col items-stretch">
                                {orderedIncludedFixtures.map(element => {                                

                                    const isSelected = selectedKeys.has(element.fixture.id);
                                    const onElementSelected = (selected: boolean) => {
                                        const updated = new Set(selectedKeys);
                                        if (selected) {
                                            updated.add(element.fixture.id);
                                        } else {
                                            updated.delete(element.fixture.id);
                                        }

                                        setSelectedKeys(updated);
                                    };

                                    return <SEFixtureCard
                                        key={element.fixture.id}
                                        element={element}
                                        isSelected={isSelected}
                                        onElementSelected={onElementSelected}
                                        onValueChanged={(newVal) => onSceneElementValueChanged(newVal)}
                                        onRemove={() => onSceneElementRemoved(element)}
                                    />;
                                })}
                            </div>
                            
                            {selectedFixtures.length >= 2 && <MultiEdit
                                elements={selectedFixtures}
                                onElementsChanged={onMultipleEditValueChanged}
                            />}
                        </div>
                    </>
                    : <>
                        <div className="text-xl text-center">Scène</div>
                        <AleasSkeletonLoader lines={5} />
                    </>}
                </div>

            </div>
        </div>

        <div className="flex flew-row justify-center items-center gap-4">
            <AleasButton
                onClick={onApplyClicked}
                disabled={!applyEnabled}
                spinning={isSaving}
            >
                Appliquer
            </AleasButton>
            <AleasButton onClick={onFinished}>
                Retour
            </AleasButton>
            <AleasButton onClick={() => setPlayScene(curr => !curr)} disabled={!playEnabled}>
                {playScene ? "Stop" : "Tester"}
            </AleasButton>
        </div> 
    </div>
}

interface DndDragObject {
    id: string;
    fixture: FixtureInfo;
}

interface DndCollectedProps {
    isDragging: boolean;
    currentOffset: XYCoord | null;
}

interface LPFixtureCardProps {
    fixture: FixtureInfo;
    enabled: boolean;
    onAddClicked: (fixture: FixtureInfo) => void;
}

interface DndDropResult {

}

const LPFixtureCard = (props: LPFixtureCardProps) => {

    const {
        fixture,
        enabled,
        onAddClicked,
    } = props;
    const {
        fullName,
        address
    } = fixture;

    const [
        { isDragging, currentOffset },
        drag
    ] = useDrag<DndDragObject, DndDropResult, DndCollectedProps>({
        type: ItemTypes.LPCard,
        item: {
            id: fixture.name, 
            fixture
        },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
            currentOffset: monitor.getSourceClientOffset(),
        }),
        canDrag: () => enabled,
        
    })

    const onClick = useCallback(enabled ? () => onAddClicked(fixture) : doNothing, [enabled, fixture]);

    return <div
        className={mergeClasses(
            "rounded-md p-2 relative overflow-visible",
            "flex flex-row items-center justify-between",
            (!enabled && "opacity-50"),
            enabled && (isDragging ? "hover:cursor-grabbing" : "hover:cursor-grab"),
            isDragging ? "bg-slate-600" : "bg-slate-800/80",
        )}
        ref={drag}
    >
        <div>{fullName} <span className="text-xs">{`(${address.toString().padStart(3, "0")})`}</span></div>
        <div className={mergeClasses(
            "text-lg font-bold px-2",
            enabled && "hover:scale-110 hover:cursor-pointer"
        )} onClick={onClick}>+</div>
    </div>
}

interface SEFixtureCardProps {
    element: SceneElementInfo;
    isSelected: boolean;
    onValueChanged: (values: SceneElementInfo) => void;
    onRemove: () => void;
    onElementSelected: (selected: boolean) => void;
}

const SEFixtureCard = (props: SEFixtureCardProps) => {

    const {
        element,
        onRemove,
        onValueChanged,
        isSelected,
        onElementSelected,
    } = props;

    const {
        fixture,
        values,
    } = element;

    const [isOpen, setIsOpen] = useState(false);

    const orderedChans = useMemo<{ type: Chans.ChannelType, priority: number, displayName: string  }[]>(() => {
        const infoMap = Chans.channelInfo;

        return Object.keys(values)
            .filter(val => Chans.isChannelType(val) && val !== "UNUSED")
            .map(val => {
                const type = val as Chans.ChannelType;
                return {
                    type,
                    ...infoMap[type]
                }
            })
            .sort((a, b) => a.priority - b.priority);
    }, [])

    const onNumberValueChanged = useCallback((type: Chans.ChannelType, val: number) => {
        if (!Chans.isNumberChannelType(type)) {
            throw new Error(`Invalid channel type ${type}: expected number channel`);
        }

        const updatedValues = {...values}
        updatedValues[type] = val;

        const updated = {
            ...element,
            values: updatedValues
        }

        onValueChanged(updated);
    }, [element, values, onValueChanged]);

    const onColorValueChanged = useCallback((type: Chans.ChannelType, color: RgbColor) => {
        if (!Chans.isColorChannelType(type)) {
            throw new Error(`Invalid channel type ${type}: expected color channel`);
        }

        const updatedValues: SceneElementValues = {...values}
        updatedValues[type] = color;
        const updated = {
            ...element,
            values: updatedValues
        }

        onValueChanged(updated);
    }, [element, values, onValueChanged]);

    return <div key={fixture.name} className={mergeClasses(
        "w-full flex flex-col items-center justify-between",  
    )}>
        <div className={mergeClasses(
            "w-full flex flex-row justify-between items-center",
            "p-2 bg-slate-800/80 rounded-t-md",
            isOpen ? "" : "rounded-b-md",
            "hover:cursor-pointer"
        )}
            onClick={() => setIsOpen(!isOpen)}    
        >
            <input
                type="checkbox"
                className="h-4 w-4"
                checked={isSelected}
                onChange={e => onElementSelected(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
            />
            <div>{fixture.fullName} <span className="text-xs">{`(${fixture.address.toString().padStart(3, "0")})`}</span></div>
            <div className="h-6 w-6">
                <svg
                    className={mergeClasses(
                        "full",
                        isOpen && "-scale-y-100",
                        "transition-transform duration-300 ease-in-out"
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </div>

        {isOpen && <div className={mergeClasses(
            "w-full py-3 px-4 rounded-b-md",
            "grid grid-cols-[auto_1fr_auto] gap-4 lg:gap-6 items-center",
            "bg-slate-800/60"
        )}>
            {orderedChans.map(chan => {
                const { type, displayName } = chan;

                return <SceneElementPropertyEditor
                    key={type}
                    displayName={displayName}
                    type={type}
                    getNumberValue={type => Chans.isNumberChannelType(type) ? values[type] as number : 0}
                    getColorValue={type => Chans.isColorChannelType(type) ? values[type] as RgbColor : Color.black}
                    onNumberValueChanged={onNumberValueChanged}
                    onColorValueChanged={onColorValueChanged}
                />
            })}
            <div className="flex flex-row items-center justify-end col-span-3">
                <AleasButton onClick={onRemove} size="Small">Retirer</AleasButton>
            </div>
        </div>}
    </div>
}

interface AleasFoldableColorPickerProps {
    color: RgbColor;
    onColorChange: Dispatch<RgbColor>;
}

const FoldableColorPicker = (props: AleasFoldableColorPickerProps) => {

    const { color } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [xOpenPosition, setXOpenPosition] = useState(0);

    return <div
        className={mergeClasses(
            "full rounded-md relative overflow-visible",
            "hover:cursor-pointer"
        )}
        style={{ backgroundColor: Color.rgbToHex(color)}}
        
    >
        {isOpen && <div className="fixed inset-0 fullscreen hover:cursor-default" onClick={() => setIsOpen(false)}></div>}
        <div className="absolute inset-0" onClick={e => {
            setXOpenPosition(e.clientX - e.currentTarget.getBoundingClientRect().left);
            return setIsOpen(!isOpen);
        }} />
        {isOpen && <div className={mergeClasses(
            "absolute -translate-x-1/2 -translate-y-1/3 z-10 p-6 bg-slate-800/70 rounded-lg",
        )} style={{ left: xOpenPosition}}>
            
            <AleasColorPicker className="hover:cursor-pointer" {...props} />
        </div>}
    </div>
}

interface SceneElementPropertyEditorProps {
    type: Chans.ChannelType;
    displayName: string;
    getNumberValue: (type: Chans.ChannelType) => number;
    getColorValue: (type: Chans.ChannelType) => RgbColor;
    onNumberValueChanged: (type: Chans.ChannelType, value: number) => void;
    onColorValueChanged: (type: Chans.ChannelType, color: RgbColor) => void;
}

const SceneElementPropertyEditor = (props: SceneElementPropertyEditorProps) => {
    const {
        type, displayName,
        getNumberValue, getColorValue,
        onNumberValueChanged, onColorValueChanged,
    } = props;

    if (Chans.isNumberChannelType(type)) {
        const value = getNumberValue(type);

        return <>
            <div>{displayName}</div>
            <div>
                <AleasSlider 
                    min={0}
                    max={255}
                    step={1}
                    orientation="horizontal"
                    value={value}
                    setValue={(value) => onNumberValueChanged(type, value)}
                    className=""
                    thumbClassName=""
                    trackClassName=""
                />
            </div>
            <div className="min-w-[2em]">{value}</div>
        </>
    }
    else if (Chans.isColorChannelType(type)) {
        const color = getColorValue(type);

        return <>
            <div>{displayName}</div>
            <FoldableColorPicker
                color={color}
                onColorChange={value => onColorValueChanged(type, value)}
            />
            <div>{Color.rgbToHex(color)}</div>
        </>
    }
    else {
        return <>
            <div>{displayName}</div>
            <div>NOT SUPPORTED YET!!</div>
        </>
    }
}


interface MultiEditProps {
    elements: SceneElementInfo[];
    onElementsChanged: (elements: SceneElementInfo[]) => void;
}

const MultiEdit = (props: MultiEditProps) => {

    const {
        elements,
        onElementsChanged
    } = props;

    const sharedTypes = useMemo(() => {
        
        const types: string[] = [];
        const foundTypes = new Set<string>();

        elements.flatMap(f => Object.keys(f.values))
            .forEach(type => {
                if (!foundTypes.has(type)) {
                    types.push(type);
                    foundTypes.add(type);
                }
            });
        
        return types;
    }, [elements])

    const getNumberValue = useCallback((type: Chans.ChannelType) => {
        let maxVal = 0;

        elements.forEach(elt => {
            if (!Chans.isNumberChannelType(type)) {
                return;
            }

            const value = elt.values[type];
            if (value !== undefined) {
                maxVal = Math.max(maxVal, value);
            }
        });

        return maxVal;
    }, [elements]);

    const getColorValue = useCallback((type: Chans.ChannelType) => {
        let maxR = 0, maxG = 0, maxB = 0;

        elements.forEach(f => {
            if (!Chans.isColorChannelType(type)) {
                return;
            }

            const value = f.values[type];
            if (value !== undefined) {
                const { r, g, b} = value as RgbColor;

                maxR = Math.max(maxR, r);
                maxG = Math.max(maxG, g);
                maxB = Math.max(maxB, b);
            }
        });

        return Color.rgb(maxR, maxG, maxB);
    }, [elements]);

    const onNumberValueChanged = useCallback((type: Chans.ChannelType, value: number) => {
        if (!Chans.isNumberChannelType(type)) {
            throw new Error(`Invalid channel type ${type}: expected number channel`);
        }
        
        const result = structuredClone(elements);

        result.forEach(elt => {
            if (elt.values[type] !== undefined) {
                elt.values[type] = value;
            }
        });

        onElementsChanged(result);
    }, [elements, onElementsChanged]);

    const onColorValueChanged = useCallback((type: Chans.ChannelType, color: RgbColor) => {
        if (!Chans.isColorChannelType(type)) {
            throw new Error(`Invalid channel type ${type}: expected color channel`);
        }

        const result = structuredClone(elements);

        result.forEach(elt => {
            if (elt.values[type] !== undefined) {
                elt.values[type] = color;
            }
        });

        onElementsChanged(result);

    }, [elements, onElementsChanged]);

    return <>
        <div className="text-xl text-center">Multi-édition</div>
        <div>Sélection: {elements.map(f => f.fixture.fullName).join(", ")}</div>
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 lg:gap-6 items-center">
            {sharedTypes.map(typeStr => {
                const type = typeStr as Chans.ChannelType;

                return <SceneElementPropertyEditor
                    key={type} type={type} displayName={type}
                    getNumberValue={getNumberValue}
                    getColorValue={getColorValue}
                    onNumberValueChanged={onNumberValueChanged}
                    onColorValueChanged={onColorValueChanged} />;
            })}
        </div>
    </>
}


const WithinContext = (props: SceneEditorProps) => <DndProvider backend={HTML5Backend}>
    <SceneEditor {...props} />
</DndProvider>

export default WithinContext;