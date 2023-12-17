import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import { useShowContext } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect } from "react";

export interface NewSceneProps {

}

const NewScene = (props: NewSceneProps) => {

    const showControl = useShowContext();
    const {
        show
    } = showControl

    const router = useRouter();

    const showName = router.query["show"] as string;

    useEffect(() => {
        if (showControl.show?.name !== showName) {
            showControl.loadShow(showName);
        }
    }, [showName, showControl]);

    return <AleasMainLayout title={showName} requireAuth>
        <div>{show?.name ?? "NO SHOW"}</div>
        <div>New Scene</div>
    </AleasMainLayout>
}

export default NewScene;