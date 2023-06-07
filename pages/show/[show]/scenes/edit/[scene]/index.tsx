import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import { useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";

export interface EditSceneProps {

}

const EditScene = (props: EditSceneProps) => {

    const showControl = useShowControl();
    const {
        show
    } = showControl

    const router = useRouter();

    return <AleasMainLayout>
        <div>{show?.name ?? "NO SHOW"}</div>
        <div>Edit Scene</div>
        <AleasButton onClick={router.back}>
            OK
        </AleasButton>
    </AleasMainLayout>
}

export default EditScene;