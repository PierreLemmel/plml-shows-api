import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import SceneEditor from "@/components/dmx/showcontrol/scene-editor";
import { mergeClasses } from "@/lib/services/core/utils";
import { Fixtures, StageLightingPlan } from "@/lib/services/dmx/dmx512";
import { createDefaultValuesForFixture, extractChannelsFromFixture, FixtureInfo, Scene, SceneElement, SceneElementInfo, useLightingPlanInfo, useSceneInfo, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { DndProvider, useDrag, useDragLayer, useDrop, XYCoord } from 'react-dnd';
import { HTML5Backend } from "react-dnd-html5-backend";



const EditScene = () => {

    const showControl = useShowControl();
    const {
        show,
        mutations: {
            saveScene
        }
    } = showControl

    const router = useRouter();

    const showName = router.query["show"] as string;
    const sceneName = router.query["scene"] as string;

    const [scene, setScene] = useState<Scene>();

    useEffect(() => {
        if (showControl.show?.name !== showName) {
            showControl.loadShow(showName);
        }
    }, [showName, showControl]);

    useEffect(() => {
        if (show) {
            const result = show.scenes.find(sc => sc.name === sceneName)
            setScene(result)
        }
    }, [showName, sceneName, show]);


    return <AleasMainLayout title={(showName && sceneName) ? `${showName} - ${sceneName}` : 'Aléas'}>
        <SceneEditor
            show={show}
            scene={scene}
            onSave={saveScene}
            onFinished={router.back} />
    </AleasMainLayout>
}




export default EditScene;