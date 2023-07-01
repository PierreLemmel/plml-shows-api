import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import { mergeClasses } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { extractChannels, FixtureInfo, Scene, SceneElement, SceneElementInfo, useLightingPlanInfo, useSceneInfo, useShowControl } from "@/lib/services/dmx/showControl";
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
    const sceneInfo = useSceneInfo(scene);
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

    const [workScene, setWorkScene] = useState<SceneElement[]>([]);
    useEffect(() => {
        if (scene) {
            const elts = structuredClone(scene.elements);
            setWorkScene(elts)
        }
    }, [scene])

    const [isOver, sceneDropZone] = useDrop<DndDragObject>({
        accept: [
            ItemTypes.LPCard,
            ItemTypes.SECard,
        ],
        drop: (item, monitor) => {
            
            const { fixture } = item;
            const {
                name,
                model
            } = fixture;

            const channels = extractChannels(model);

            const foo: SceneElement = {
                fixture: name,
                values: {

                }
            }
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
                    {lightingPlan ?
                        <div className={mergeClasses(
                            "w-full flex flex-col items-stretch gap-2",
                        )}>
                            {Object.entries(lightingPlan.fixtures).map(([shortName, fixture]) => {
                                const enabled = workScene.find(se => se.fixture === shortName) === undefined;

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
    const { name } = fixture;

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
        {name}
    </div>
}

interface SEFixtureCardProps {
    element: SceneElementInfo;
}

const SEFixtureCard = (props: SEFixtureCardProps) => {

    const { element } = props;
    const { fixture } = element;

    return <div key={fixture.name} className={mergeClasses(
        "w-full flex flex-row items-center justify-between",
        "p-2 bg-slate-800/80 rounded-md"
    )}>
        {fixture.fullName}
    </div>
}

const WithinContext = () => <DndProvider backend={HTML5Backend}>
    <EditScene />
</DndProvider>


export default WithinContext;