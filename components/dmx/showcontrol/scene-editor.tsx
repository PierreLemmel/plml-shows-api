import { AleasButton } from "@/components/aleas/aleas-buttons";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import { replaceFirstElement } from "@/lib/services/core/arrays";
import { Color } from "@/lib/services/core/types/rgbColor";
import { Action, AsyncDipsatch } from "@/lib/services/core/types/utils";
import { match, mergeClasses, withValue } from "@/lib/services/core/utils";
import { Chans, DmxRange } from "@/lib/services/dmx/dmx512";
import { createDefaultValuesForFixture, FixtureInfo, Scene, SceneElement, SceneElementInfo, Show, toScene, useLightingPlanInfo, useSceneInfo, useShowControl } from "@/lib/services/dmx/showControl";
import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DmxSlider from "../dmx-slider";

export interface SceneEditorProps {
    show: Show|undefined;
    scene: Scene|undefined;
    onSave: AsyncDipsatch<Scene>|Dispatch<Scene>;
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

    const showControl = useShowControl();
    const lightingPlan = useLightingPlanInfo();

    useEffect(() => {
        showControl.setMode("Show")
    }, [showControl])

    const [workScene, setWorkScene] = useState<Scene>();
    useEffect(() => {
        if (scene) {
            const clone = structuredClone(scene);
            setWorkScene(clone)
        }
    }, [scene])

    const sceneInfo = useSceneInfo(workScene);

    const [ , sceneDropZone] = useDrop<DndDragObject>({
        accept: [
            ItemTypes.LPCard,
            ItemTypes.SECard,
        ],
        drop: (item) => {
            if (!workScene) {
                return;
            }
            
            const { fixture } = item;
            const {
                name,
                model
            } = fixture;

            const seValues = createDefaultValuesForFixture(model);

            const newSceneElement: SceneElement = {
                fixture: name,
                values: seValues,
            }

            const updated = [...workScene.elements, newSceneElement];
            setWorkScene({
                ...workScene,
                elements: updated,
            });
        },
        collect: monitor => monitor.isOver(),
    })

    const applyEnabled = workScene !== undefined;
    const [isSaving, setIsSaving] = useState(false);
    const onApplyClicked = async () => {

        if (!workScene) {
            return;
        }

        setIsSaving(true);
        await onSave(workScene);
        setIsSaving(false);
    }

    const onSceneElementValueChanged = useCallback((element: SceneElementInfo) => {
        if (!sceneInfo || !workScene) {
            return;
        }
        
        const updatedElements = replaceFirstElement(sceneInfo.elements, sei => sei.fixture.id === element.fixture.id, element);

        const updatedSI = withValue(sceneInfo, "elements", updatedElements);
        const updatedScene = toScene(updatedSI);

        setWorkScene(updatedScene);
    }, [workScene, sceneInfo]);

    const onSceneElementRemoved = useCallback((element: SceneElementInfo) => {
        if (!sceneInfo || !workScene) {
            return;
        }

        const { elements } = sceneInfo;
        const remaining = elements
            .filter(se => se.fixture.id !== element.fixture.id);

        const updatedSI = withValue(sceneInfo, "elements", remaining);
        const updatedScene = toScene(updatedSI);

        setWorkScene(updatedScene);
        
    }, [workScene, sceneInfo])

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
                            {Object.entries(lightingPlan.fixtures).map(([shortName, fixture]) => {
                                const enabled = workScene.elements.find(se => se.fixture === shortName) === undefined;

                                return <LPFixtureCard
                                    key={fixture.id}
                                    fixture={fixture}
                                    enabled={enabled}
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
                                "flex flex-col items-stretch gap-2",
                        )}>
                            {sceneInfo.elements.map(element => {                                

                                return <SEFixtureCard
                                    key={element.fixture.id}
                                    element={element}
                                    onValueChanged={(newVal) => onSceneElementValueChanged(newVal)}
                                    onRemove={() => onSceneElementRemoved(element)}
                                />;
                            })}
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
}

interface DndDropResult {

}

const LPFixtureCard = (props: LPFixtureCardProps) => {

    const {
        fixture,
        enabled,
    } = props;
    const { fullName } = fixture;

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

    return <div
        className={mergeClasses(
            "rounded-md p-2 relative overflow-visible",
            (!enabled && "opacity-50"),
            enabled && (isDragging ? "hover:cursor-grabbing" : "hover:cursor-grab"),
            isDragging ? "bg-slate-600" : "bg-slate-800/80",
        )}
        ref={drag}
    >
        {fullName}
    </div>
}

interface SEFixtureCardProps {
    element: SceneElementInfo;
    onValueChanged: (values: SceneElementInfo) => void;
    onRemove: () => void;
}

const SEFixtureCard = (props: SEFixtureCardProps) => {

    const {
        element,
        onRemove,
        onValueChanged
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

    return <div key={fixture.name} className={mergeClasses(
        "w-full flex flex-col items-center justify-between",
        
    )}>
        <div className={mergeClasses(
            "w-full flex flex-row justify-between",
            "p-2 bg-slate-800/80 rounded-t-md",
            isOpen ? "" : "rounded-b-md",
            "hover:cursor-pointer"
        )}
            onClick={() => setIsOpen(!isOpen)}    
        >
            <div>{fixture.fullName}</div>
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
            "w-full flex flex-col items-stretch gap-2 py-3 px-4 rounded-b-md  ",
            "bg-slate-800/60"
        )}>
            {orderedChans.map(chan => {
                const { type, displayName } = chan;

                return <div key={type} className="flex flex-row justify-between">
                    <div>{displayName}</div>
                    {Chans.isNumberChannel(type) && <div>
                        <DmxSlider
                            orientation="horizontal"
                            value={values[type]!}
                            setValue={(val) => {
                                const updatedValues = {...values}
                                updatedValues[type] = val as DmxRange;
                                const updated = withValue(element, "values", values);

                                onValueChanged(updated);
                            }}
                        />
                    </div>}
                    {Chans.isColorChannel(type) && <div>
                        {JSON.stringify(Color.getColorValue(values[type]!))}
                    </div>}
                </div>
            })}
            <div className="flex flex-row items-center justify-end">
                <AleasButton onClick={onRemove} size="Small">Retirer</AleasButton>
            </div>
        </div>}
    </div>
}

const WithinContext = (props: SceneEditorProps) => <DndProvider backend={HTML5Backend}>
    <SceneEditor {...props} />
</DndProvider>

export default WithinContext;