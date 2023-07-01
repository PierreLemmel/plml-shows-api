import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import { mergeClasses } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { createDefaultValuesForFixture, extractChannelsFromFixture, FixtureInfo, Scene, SceneElement, SceneElementInfo, useLightingPlanInfo, useSceneInfo, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { DndProvider, useDrag, useDragLayer, useDrop, XYCoord } from 'react-dnd';
import { HTML5Backend } from "react-dnd-html5-backend";

enum ItemTypes {
    SECard = "SceneElementCard",
    LPCard = "LightingPlanCard",
    SEColumn = "SceneElementColumn",
} 

const EditScene = () => {

    const showControl = useShowControl();
    const {
        show,
    } = showControl

    const router = useRouter();

    const showName = router.query["show"] as string;
    const sceneName = router.query["scene"] as string;

    const [scene, setScene] = useState<Scene>();
    const lightingPlan = useLightingPlanInfo();

    useEffect(() => {
        if (showControl.show?.name !== showName) {
            showControl.loadShow(showName);
        }
    }, [showName, showControl]);

    useEffect(() => {
        showControl.setMode("Show")
    }, [showControl])

    useEffect(() => {
        if (show) {
            const result = show.scenes.find(sc => sc.name === sceneName)
            setScene(result)
        }
    }, [showName, sceneName, show]);

    const [workScene, setWorkScene] = useState<Scene>();
    useEffect(() => {
        if (scene) {
            const clone = structuredClone(scene);
            setWorkScene(clone)
        }
    }, [scene])

    const sceneInfo = useSceneInfo(workScene);

    const [isOver, sceneDropZone] = useDrop<DndDragObject>({
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

    const onApplyClicked = useCallback(() => {
        console.log("Apply clicked", scene)
    }, [])

    return <AleasMainLayout title={`${showName} - ${sceneName}`}>
        <div className={mergeClasses(
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
                                    key={fixture.name}
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
                                key={element.fixture.name}
                                element={element}
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
                <AleasButton onClick={onApplyClicked}>
                    Appliquer
                </AleasButton>
                <AleasButton onClick={router.back}>
                    Retour
                </AleasButton>
            </div> 
        </div>
    </AleasMainLayout>
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
}

const SEFixtureCard = (props: SEFixtureCardProps) => {

    const { element } = props;
    const { fixture } = element;

    const [isOpen, setIsOpen] = useState(false);

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
            "w-full flex flex-col items-stretch gap-2",
            "bg-slate-800/70"
        )}>
            HELLO
        </div>}
    </div>
}

const WithinContext = () => <DndProvider backend={HTML5Backend}>
    <EditScene />
</DndProvider>


export default WithinContext;