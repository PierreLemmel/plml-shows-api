import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import { mergeClasses } from "@/lib/services/core/utils";
import { Scene, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DndContext, DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


const EditScene = () => {

    const showControl = useShowControl();
    const {
        show,
        lightingPlan
    } = showControl

    const router = useRouter();

    const showName = router.query["show"] as string;
    const sceneName = router.query["scene"] as string;

    const [scene, setScene] = useState<Scene>()

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
    }, [showName, sceneName, show])

    const [isOver, sceneDropZone] = useDrop({
        accept: "fixture",
        drop: (item, monitor) => {
        },
        collect: monitor => monitor.isOver(),
    })

    return <AleasMainLayout title={`${showName} - ${sceneName}`}>
        <div className={mergeClasses(
            "full flex flex-col items-stretch justify-between gap-4",

        )}>
            <div className="grid grid-cols-2 gap-6 flex-grow">
                <div className={mergeClasses(
                    "w-full flex flex-col items-stretch gap-4",
                    "bg-slate-700/80 px-3 py-2 rounded-lg",
                )}>
                    <div className="text-xl text-center">Plan de feu</div>
                    {lightingPlan ?
                        <div className={mergeClasses(
                            "w-full flex flex-col items-stretch gap-2",
                        )}>
                            {Object.values(lightingPlan.fixtures).map(fixture => {
                                const { name } = fixture;

                                return <div key={name} className={mergeClasses(
                                )}>
                                    {name}
                                </div>
                            })}
                        </div> :
                        <AleasSkeletonLoader lines={5} />}
                </div>

                <div className={mergeClasses(
                    "w-full flex flex-col items-stretch gap-4",
                    "bg-slate-700/80 px-3 py-2 rounded-lg",
                )}>
                    {scene ? <>
                        <div className="text-xl text-center">{scene.name}</div>
                        <div
                            ref={sceneDropZone}
                            className={mergeClasses(
                            "w-full flex flex-col items-stretch gap-2",
                        )}>
                            {scene.elements.map(element => {
                                const { fixture } = element;

                                return <div key={fixture} className={mergeClasses(
                                )}>
                                    {fixture}
                                </div>
                            })}
                        </div>
                    </>
                    : <>
                        <div className="text-xl text-center">Scène</div>
                        <AleasSkeletonLoader lines={5} />
                    </>}
                </div>
            </div>

            <div className="flex flew-row justify-center items-center gap-4">
                <AleasButton onClick={router.back}>
                    OK
                </AleasButton>
            </div> 
        </div>
    </AleasMainLayout>
}


export default () => <DndProvider backend={HTML5Backend}>
    <EditScene />
</DndProvider>;