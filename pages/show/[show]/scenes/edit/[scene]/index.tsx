import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import { useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect } from "react";


const EditScene = () => {

    const showControl = useShowControl();
    const {
        show
    } = showControl

    const router = useRouter();

    const showName = router.query["show"] as string;
    const sceneName = router.query["scene"] as string;

    useEffect(() => {
        if (showControl.show?.name !== showName) {
            showControl.loadShow(showName);
        }
    }, [showName]);

    useEffect(() => {
        showControl.setMode("Show")
    }, [])

    useEffect(() => {
        //...
    }, [showName, sceneName])




    return <AleasMainLayout title={`${showName} - ${sceneName}`}>
        <div>{show?.name ?? "NO SHOW"}</div>
        <div>Edit Scene</div>
        <AleasButton onClick={router.back}>
            OK
        </AleasButton>
    </AleasMainLayout>
}

export default EditScene;