import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import SceneEditor from "@/components/dmx/showcontrol/scene-editor";
import { Scene, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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


    return <AleasMainLayout
        title={(showName && sceneName) ? `${showName} - ${sceneName}` : 'Aléas'}
        requireAuth
    >
        <SceneEditor
            show={show}
            scene={scene}
            onSave={saveScene}
            onFinished={router.back} />
    </AleasMainLayout>
}

export default EditScene;