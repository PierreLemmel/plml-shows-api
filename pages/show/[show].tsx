import AleasBackground from "@/components/aleas/aleas-background";
import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasDropdown, DropdownOption } from "@/components/aleas/aleas-dropdown";
import AleasHead from "@/components/aleas/aleas-head";
import { AleasMainContainer, AleasMainLayout, AleasTitle } from "@/components/aleas/aleas-layout";
import { Scene, ShowControlContext, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect } from "react";


const ShowPage = () => {
   
    const showControl = useShowControl();
    const { show } = showControl;

    const router = useRouter();
    const showName = router.query["show"] as string;

    useEffect(() => {
        showControl.loadShow(showName);
    }, [showName])

    const dropdownOptions: DropdownOption<Scene>[] = show?.scenes.map(scene => {
        return {
            label: scene.name,
            value: scene
        }
    }) || []
    const onDropdownSelectionChanged = (option: DropdownOption<Scene>) => {
        console.log(option)
    }

    const playBtnEnabled = true;
    const onPlayBtnClicked = () => {

    }

    const stopBtnEnabled = false;
    const onStopBtnClicked = () => {

    }

    return <ShowControlContext.Provider value={showControl}>

        <AleasMainLayout title={showName}>
            <div className="centered-col gap-4">
                <div className="centered-row gap-3">

                    <div className="text-lg">
                        Scenes:
                    </div>

                    <AleasDropdown
                        options={dropdownOptions}
                        onSelectedOptionChanged={onDropdownSelectionChanged}
                        placeholder="Select a scene"
                    />
                </div>

                <div className="centered-row gap-3">
                    <AleasButton
                        onClick={onPlayBtnClicked}
                        disabled={!playBtnEnabled}
                    >
                        Play
                    </AleasButton>

                    <AleasButton
                        onClick={onStopBtnClicked}
                        disabled={!stopBtnEnabled}
                    >
                        Stop
                    </AleasButton>
                </div>
                
            </div>
        </AleasMainLayout>

    </ShowControlContext.Provider>
        
}

export default ShowPage;