import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasDropdownButton, DropdownOption } from "@/components/aleas/aleas-dropdowns";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import DmxSlider from "@/components/dmx/dmx-slider";
import { Scene, Track, useShowControl } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";


const ShowPage = () => {
   
    const showControl = useShowControl();
    const {
        show,
        controler,
    } = showControl;

    const {
        master, setMaster,
        fade, setFade,
        currentTrack
    } = controler;

    const router = useRouter();

    const showName = router.query["show"] as string;
    
    const [scene, setScene] = useState<Scene>();
    const [track, setTrack] = useState<Track>();

    useEffect(() => {
        if (showControl.show?.name !== showName) {
            showControl.loadShow(showName);
        }
    }, [showName, showControl]);

    useEffect(() => {
        if (currentTrack) {
            setTrack(currentTrack);
            setScene(currentTrack.scene)
        }
    }, [currentTrack])

    useEffect(() => {
        showControl.setMode("Show")
    }, [showControl]);

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

    const clearCurrentTrack = useCallback(() => {
        if (track && controler) {
            controler.removeTrack(track);
            setTrack(undefined)
        }
    }, [track, controler]);

    const playBtnEnabled = scene !== undefined;
    const onPlayBtnClicked = useCallback(() => {

        if (scene && controler) {
            clearCurrentTrack();
            const newTrack = controler.addTrack(scene);
            setTrack(newTrack);
        }
    }, [controler, scene, clearCurrentTrack]);

    const stopBtnEnabled = track !== undefined;
    const onStopBtnClicked = useCallback(() => {
        clearCurrentTrack();
    }, [clearCurrentTrack]);

    const editBtnClicked = scene !== undefined;
    const onEditBtnClicked = useCallback(() => {
        if (scene) {
            router.push(`${router.asPath}/scenes/edit/${scene.name}`);
        }
    }, [scene, router]);

    const newBtnEnabled = true;
    const onNewSceneBtnClicked = useCallback(() => {
        router.push(`${router.asPath}/scenes/new`)
    }, [router]);

    return <AleasMainLayout title={showName} requireAuth>
        <div className="centered-row gap-4">
            <div className="centered-col gap-8">
                <div className="centered-row gap-3">

                    <div className="text-lg">
                        Scenes:
                    </div>

                    <AleasDropdownButton
                        options={dropdownOptions}
                        value={selectedOption}
                        onSelectedOptionChanged={onDropdownSelectionChanged}
                        placeholder="Select a scene"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
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

                    <AleasButton
                        onClick={onNewSceneBtnClicked}
                        disabled={!newBtnEnabled}
                    >
                        New scene
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

export default ShowPage
