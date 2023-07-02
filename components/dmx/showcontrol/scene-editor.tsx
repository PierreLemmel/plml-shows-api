import { AleasButton } from "@/components/aleas/aleas-buttons";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import { Action, AsyncDipsatch } from "@/lib/services/core/types/utils";
import { match, mergeClasses } from "@/lib/services/core/utils";
import { Chans } from "@/lib/services/dmx/dmx512";
import { createDefaultValuesForFixture, FixtureInfo, Scene, SceneElement, SceneElementInfo, Show, useLightingPlanInfo, useSceneInfo, useShowControl } from "@/lib/services/dmx/showControl";
import { Dispatch, useEffect, useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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

    function onSceneElementValueChanged(): void {
        throw new Error("Function not implemented.");
    }

    return <div className={mergeClasses(
        "full flex flex-col items-stretch justify-between gap-4",
    )}>
        <div className="grid grid-cols-2 gap-6 flex-grow">

            {/* LP Column */}
            <div className={mergeClasses(
                "w-full flex flex-col items-stretch gap-4",
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
                "w-full flex flex-col items-stretch gap-4",
                "bg-slate-700/80 px-3 py-2 rounded-lg",
            )}>
                {sceneInfo ? <>
                    <div className="text-xl text-center">{sceneInfo.name}</div>
                    <div
                        ref={sceneDropZone}
                        className={mergeClasses(
                            "w-full flex-grow overflow-y-auto",
                            "flex flex-col items-stretch gap-2",
                    )}>
                        {sceneInfo.elements.map(element => <SEFixtureCard
                            key={element.fixture.id}
                            element={element}
                            onValueChanged={onSceneElementValueChanged}
                        />)}
                    </div>
                </>
                : <>
                    <div className="text-xl text-center">Scène</div>
                    <AleasSkeletonLoader lines={5} />
                </>}
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
    onValueChanged: () => void;
}

const SEFixtureCard = (props: SEFixtureCardProps) => {

    const { element } = props;
    const {
        fixture,
        values
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

                return <div key={chan.type} className="flex flex-row justify-between">
                    <div>{chan.displayName}</div>
                    {match(chan.type, [{
                        condition: Chans.isNumberChannel,
                        value: <div>{values[chan.type as Chans.NumberChannelType] as number}</div>,
                    },
                    {
                        condition: Chans.isColorChannel,
                        value: <div>{JSON.stringify(values[chan.type as Chans.ColorChannelType])}</div>,
                    }])}
                </div>
            })}
        </div>}
    </div>
}

const WithinContext = (props: SceneEditorProps) => <DndProvider backend={HTML5Backend}>
    <SceneEditor {...props} />
</DndProvider>

export default WithinContext;