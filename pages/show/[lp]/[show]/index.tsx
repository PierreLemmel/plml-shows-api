import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasDropdownButton, DropdownOption } from "@/components/aleas-components/aleas-dropdowns";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasModalDialog from "@/components/aleas-components/aleas-modal-dialog";
import AleasTextField from "@/components/aleas-components/aleas-textfield";
import { toast } from "@/components/aleas-components/aleas-toast-container";
import DmxSlider from "@/components/dmx/dmx-slider";
import { createScene, Scene, useRealtimeScene, useShowContext } from "@/lib/services/dmx/showControl";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";


const ShowPage = () => {
   
    const showControl = useShowContext();
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
    const [isPlaying, setIsPlaying] = useState(false);
    const track = useRealtimeScene(scene, isPlaying);

    useEffect(() => {
        if (showControl.show?.name !== showName) {
            showControl.loadShow(showName);
        }
    }, [showName, showControl]);


    useEffect(() => {
        showControl.setMode("Show")
    }, [showControl]);

    const dropdownOptions: DropdownOption<Scene>[] = useMemo(() => show?.scenes.map(scene => {
        return {
            label: scene.name,
            value: scene
        }
    }) || [], [show]); 

    const onDropdownSelectionChanged = (newScene: Scene) => {
        setScene(newScene);
    }

    const toggleBtnEnabled = isPlaying ? track !== null : scene !== undefined;
    const onToggleBtnClicked = () => setIsPlaying(curr => !curr);

    const editBtnClicked = scene !== undefined;
    const onEditBtnClicked = () => {
        if (scene) {
            router.push(`${router.asPath}/scenes/edit/${scene.name}`);
        }
    };

    const newBtnEnabled = true;
    const [newModalOpened, setNewModalOpened] = useState(false);
    const [newSceneName, setNewSceneName] = useState("");

    const onNewSceneBtnClicked = () =>{
        setNewSceneName("");
        setNewModalOpened(true);
    }

    const onNewModalCancel = () => setNewModalOpened(false);

    const onNewModalValidate = async () => {

        if (!show) {
            return;
        }

        const newScene = createScene(newSceneName);
        await showControl.mutations.addScene(newScene);

        router.push(`${router.asPath}/scenes/edit/${newSceneName}`);
    }


    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const deleteBtnEnabled = scene !== undefined;
    const onDeleteBtnClicked = () => setDeleteAlertOpen(true);
    const onDeleteModalCancel = () => setDeleteAlertOpen(false);
    const onDeleteModalConfirm = async () => {
        if (!show || !scene) {
            return;
        }

        const sceneName = scene.name;
        await showControl.mutations.deleteScene(scene);
        setDeleteAlertOpen(false);

        toast.info(`La scène ${sceneName} a été supprimée`);
    }

    return <AleasMainLayout title={showName} requireAuth toasts>
        <div className="centered-row gap-4">
            <div className="centered-col gap-8">
                <div className="centered-row gap-3">

                    <div className="text-lg">
                        Scenes:
                    </div>

                    <AleasDropdownButton
                        options={dropdownOptions}
                        value={scene}
                        onValueChanged={onDropdownSelectionChanged}
                        placeholder="Select a scene"
                    />
                </div>

                <div className="flex flex-row items-center justify-center gap-3">
                    <AleasButton
                        onClick={onToggleBtnClicked}
                        disabled={!toggleBtnEnabled}
                    >
                        {isPlaying ? "Stop" : "Tester"}
                    </AleasButton>

                    <AleasButton
                        onClick={onEditBtnClicked}
                        disabled={!editBtnClicked}
                    >
                        Editer
                    </AleasButton>

                    <AleasButton
                        onClick={onNewSceneBtnClicked}
                        disabled={!newBtnEnabled}
                    >
                        Nouvelle scène
                    </AleasButton>

                    <AleasButton
                        onClick={onDeleteBtnClicked}
                        disabled={!deleteBtnEnabled}
                    >
                        Supprimer
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

        <AleasModalDialog
            isOpen={newModalOpened}
            onConfirm={onNewModalValidate}
            onCancel={onNewModalCancel}
            canValidate={newSceneName.length >= 4}
        >
            <div className="flex flex-col justify-center items-center gap-3 mb-10">
                <div>Entrez un nom pour la nouvelle scène :</div>
                <AleasTextField value={newSceneName} onValueChange={setNewSceneName} />
            </div>
        </AleasModalDialog>

        <AleasModalDialog
            isOpen={deleteAlertOpen}
            onConfirm={onDeleteModalConfirm}
            onCancel={onDeleteModalCancel}
            confirmText="Oui"
            cancelText="Non"
        >
            <div className="flex flex-col justify-center items-center gap-3 mb-10">
                <div>Êtes-vous certain·e de vouloir supprimer la scène ?</div>
            </div>
        </AleasModalDialog>

    </AleasMainLayout>
}

export default ShowPage
