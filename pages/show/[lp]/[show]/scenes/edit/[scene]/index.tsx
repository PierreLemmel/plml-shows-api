import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import SceneEditor from "@/components/dmx/showcontrol/scene-editor";
import { useRouterQuery } from "@/lib/services/api/routing";
import { updateShow } from "@/lib/services/api/show-control-api";
import { replaceFirstElement } from "@/lib/services/core/arrays";
import { withValue } from "@/lib/services/core/utils";
import { Scene, useLoadShowInContextIfNeeded, useShowContext } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const EditScene = () => {

    const showControl = useShowContext();
    const {
        show,
        setShow
    } = showControl

    const router = useRouter();

    const {
        "lp": lpName,
        "show": showName,
        "scene": sceneName,
    } = useRouterQuery("lp", "show", "scene");

    const [scene, setScene] = useState<Scene>();

    useLoadShowInContextIfNeeded(lpName, showName);

    useEffect(() => {
        if (!show) {
            return;
        }

        const result = show.scenes.find(sc => sc.name === sceneName)
        setScene(result)

    }, [showName, sceneName, show]);

    const saveScene = useCallback(async (savedScene: Scene) => {

        if (!show) {
            return;
        }

        const newScenes = replaceFirstElement(show.scenes, sc => sc.id === savedScene.id, savedScene);
        const newShow = withValue(show, "scenes", newScenes);

        await updateShow({
            name: show.name,
            lightingPlan: show.lightingPlan,
            scenes: newScenes
        });
        showControl.setShow(newShow);
    }, [show, lpName]);


    return <AleasMainLayout
        title={(showName && sceneName) ? `${showName} - ${sceneName}` : 'Aléas'}
        requireAuth
    >
        {show && scene ? 
            <SceneEditor
                show={show} scene={scene}
                onSave={saveScene} onFinished={router.back} /> :
            <AleasSkeletonLoader />}
    </AleasMainLayout>
}

export default EditScene;