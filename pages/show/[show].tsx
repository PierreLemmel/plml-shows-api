import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasDropdown, DropdownOption } from "@/components/aleas/aleas-dropdown";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import { generateSceneInfo, Scene, SceneInfo, ShowControlContext, Track, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";


const ShowPage = () => {
   
    const showControl = useShowControl();
    const {
        show,
        controler,
        lightingPlan,
        fixtureCollection,
    } = showControl;

    const router = useRouter();
    const showName = router.query["show"] as string;

    const [scene, setScene] = useState<Scene>();

    const [track, setTrack] = useState<Track>();

    useEffect(() => {
        showControl.loadShow(showName);
    }, [showName]);


    const dropdownOptions: DropdownOption<Scene>[] = show?.scenes.map(scene => {
        return {
            label: scene.name,
            value: scene
        }
    }) || []; 

    const selectedOption = useMemo(() => dropdownOptions.find(o => o.value === scene), [scene])
    const onDropdownSelectionChanged = (option: DropdownOption<Scene>) => {
        setScene(option.value);
    }

    const clearCurrentTrack = () => {
        if (track && controler) {
            controler.removeTrack(track);
            setTrack(undefined)
        }
    }

    const playBtnEnabled = scene !== undefined;
    const onPlayBtnClicked = () => {

        if (scene && controler) {
            clearCurrentTrack();
            const newTrack = controler.addTrack(scene);
            setTrack(newTrack);
        }
    }

    const stopBtnEnabled = track !== undefined;
    const onStopBtnClicked = () => {

        clearCurrentTrack();
    }

    

    return <ShowControlContext.Provider value={showControl}>

        <AleasMainLayout title={showName}>
            <div className="centered-col gap-8">
                <div className="centered-row gap-3">

                    <div className="text-lg">
                        Scenes:
                    </div>

                    <AleasDropdown
                        options={dropdownOptions}
                        value={selectedOption}
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
                
                {<div className="flex flex-col gap-4">
                    <div>{track ?
                        <>Currently playing: {track.name}</> :
                        <>No Scene playing</>
                    }</div>
                </div>}

            </div>
        </AleasMainLayout>

    </ShowControlContext.Provider>
        
}

export default ShowPage;