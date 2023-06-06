import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import { useShowControl } from "@/lib/services/dmx/showControl";

export interface NewSceneProps {

}

const NewScene = (props: NewSceneProps) => {

    const showControl = useShowControl();
    const {
        show
    } = showControl

    return <AleasMainLayout title="New Scene">
        <div>{show?.name ?? "NO SHOW"}</div>
        <div>New Scene</div>
    </AleasMainLayout>
}

export default NewScene;