import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import { useNavigation } from "@/lib/services/core/navigation";
import { useShowControl } from "@/lib/services/dmx/showControl";

export interface EditSceneProps {

}

const EditScene = (props: EditSceneProps) => {

    const showControl = useShowControl();
    const {
        show
    } = showControl

    const navigation = useNavigation();
    const { back } = navigation;

    return <AleasMainLayout>
        <div>{show?.name ?? "NO SHOW"}</div>
        <div>Edit Scene</div>
        <AleasButton onClick={back}>
            OK
        </AleasButton>
    </AleasMainLayout>
}

export default EditScene;