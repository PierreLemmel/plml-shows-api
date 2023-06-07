import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasDropdown, DropdownOption } from "@/components/aleas/aleas-dropdown";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import DmxSlider from "@/components/dmx/dmx-slider";
import { Scene, Track, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";


const ShowPage = () => {
   
    const showControl = useShowControl();
    const {
        show,
        controler,
    } = showControl;

    const {
        master, setMaster,
        fade, setFade,
        
    } = controler;

    const router = useRouter();

    const showName = router.query["show"] as string;
    
    const [scene, setScene] = useState<Scene>();
    const [track, setTrack] = useState<Track>();

    useEffect(() => {
        showControl.loadShow(showName);
    }, [showName]);

    useEffect(() => {
        showControl.setMode("Show")
    }, [])

    const dropdownOptions: DropdownOption<Scene>[] = useMemo(() => show?.scenes.map(scene => {
        return {
            label: scene.name,
            value: scene
        }
    }) || [], [show]); 

    const selectedOption = useMemo(() => dropdownOptions.find(o => o.value === scene), [scene, dropdownOptions])
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

    const editBtnClicked = scene !== undefined;
    const onEditBtnClicked = () => {
        if (scene) {
            router.push(`${router.asPath}/scenes/edit/${scene.name}`);
        }
    }

    return <AleasMainLayout title={showName}>
        <div className="centered-row gap-4">
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

                    <AleasButton
                        onClick={onEditBtnClicked}
                        disabled={!editBtnClicked}
                    >
                        Edit
                    </AleasButton>
                </div>
                
                {<div className="flex flex-col gap-4">
                    <div>{track ?
                        <>Currently playing: {track.name}</> :
                        <>No Scene playing</>
                    }</div>
                </div>}

            </div>
            <div className="flex flex-col gap-3 items-center ml-12">
                <div>Fade</div>
                <DmxSlider
                    value={fade}
                    setValue={setFade}
                    sliderType="Value"
                    min={0} max={10}
                    step={0.1}
                />
            </div>
            <div className="flex flex-col gap-3 items-center">
                <div>Master</div>
                <DmxSlider value={master} setValue={setMaster} sliderType="Percent" />
            </div>
        </div>
    </AleasMainLayout>
}

export default ShowPage;

function useQuery() {
    throw new Error("Function not implemented.");
}
