import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import AleasSpinningLoader from "@/components/aleas/aleas-spinning-loader";
import { Scene, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


const EditScene = () => {

    const showControl = useShowControl();
    const {
        show
    } = showControl

    const router = useRouter();

    const showName = router.query["show"] as string;
    const sceneName = router.query["scene"] as string;

    const [scene, setScene] = useState<Scene>()

    useEffect(() => {
        if (showControl.show?.name !== showName) {
            showControl.loadShow(showName);
        }
    }, [showName]);

    useEffect(() => {
        showControl.setMode("Show")
    }, [])

    useEffect(() => {
        if (show) {
            const result = show.scenes.find(sc => sc.name === sceneName)
            setScene(result)
        }
    }, [showName, sceneName])




    return <AleasMainLayout title={`${showName} - ${sceneName}`}>
        
        {scene ? <div>{JSON.stringify(scene)}</div> : <AleasSkeletonLoader lines={5} />}
        <AleasButton onClick={router.back}>
            OK
        </AleasButton>
    </AleasMainLayout>
}

export default EditScene;