import { AleasButton, AleasIconButton } from "@/components/aleas-components/aleas-buttons"
import { AleasDropdownButton, DropdownOption } from "@/components/aleas-components/aleas-dropdowns"
import AleasModalDialog from "@/components/aleas-components/aleas-modal-dialog"
import { AleasPopoverTextInput } from "@/components/aleas-components/aleas-popover-inputs"
import AleasTextField from "@/components/aleas-components/aleas-textfield"
import { AsyncDispatch } from "@/lib/services/core/types/utils"
import { doNothing, isEmpty, mergeClasses, simplyReturn, withValue } from "@/lib/services/core/utils"
import { Validators } from "@/lib/services/core/validation"
import { addSceneToShow, createNewScene, deleteSceneInShow, Scene, Show, useRealtimeScene, useSceneInfo, useShowControl } from "@/lib/services/dmx/showControl"
import router from "next/router"
import { Dispatch, useCallback, useMemo, useState } from "react"

import DmxSlider from "../dmx-slider"

export type ShowEditorProps = {
    show: Show;
    onMessage: Dispatch<string>;
    saveShow: AsyncDispatch<Show>;
    sceneEditPath: (sceneName: string) => string;
} & ({
    canRename?: false;
    renameValidation?: never;
    onRename?: never;
    onRenameFail?: never;
} | {
    canRename: true;
    renameValidation?: (newName: string) => Promise<boolean>;
    onRename?: Dispatch<string>;
    onRenameFail?: Dispatch<string>;
})

const ShowEditor = (props: ShowEditorProps) => {

    const {
        show,
        onMessage = doNothing,
        saveShow,
        canRename = false,
        renameValidation = simplyReturn(true),
        onRename = doNothing,
        onRenameFail = doNothing,
        sceneEditPath
    } = props;

    const {
        master, setMaster,
        fade, setFade,
    } = useShowControl();

    const [scene, setScene] = useState<Scene>();
    const [isPlaying, setIsPlaying] = useState(false);

    const sceneInfo = useSceneInfo(scene);
    const track = useRealtimeScene(sceneInfo, isPlaying);


    const dropdownOptions: DropdownOption<Scene>[] = useMemo(() => show.scenes.map(scene => {
        return {
            label: scene.name,
            value: scene
        }
    }), [show]); 

    const onDropdownSelectionChanged = (newScene: Scene) => {
        setScene(newScene);
    }

    const toggleBtnEnabled = isPlaying ? track !== null : scene !== undefined;
    const onToggleBtnClicked = () => setIsPlaying(curr => !curr);

    const editBtnEnabled = scene !== undefined;
    const onEditBtnClicked = useCallback(() => {
        if (scene) {
            const path = sceneEditPath(scene.name);
            router.push(path);
        }
    }, [scene]);

    const newBtnEnabled = true;
    const [newModalOpened, setNewModalOpened] = useState(false);
    const [newSceneName, setNewSceneName] = useState("");

    const onNewSceneBtnClicked = useCallback(async () =>{
        setNewSceneName("");
        setNewModalOpened(true);
    }, []);

    const onNewModalCancel = () => setNewModalOpened(false);

    const onNewModalValidate = useCallback(async () => {

        const newScene = createNewScene(newSceneName);
        const updatedShow = addSceneToShow(show, newScene);
        await saveShow(updatedShow);

        const newScenePath = sceneEditPath(newSceneName);
        
        router.push(newScenePath);
        
    }, [sceneEditPath, newSceneName, show]);


    const deleteBtnEnabled = scene !== undefined;
    const onDeleteBtnClicked = async () => {
        if (!scene) {
            return;
        }

        const sceneName = scene.name;
        deleteSceneInShow(show, scene);
        await saveShow(show);

        onMessage(`La scène '${sceneName}' a été supprimée`);
    }

    const onShowRename = useCallback(async (newName: string) => {
        const canRename = await renameValidation(newName);
        if (canRename) {
            const newShow = withValue(show, "name", newName);
            onRename(newName);
            await saveShow(newShow)
        }
        else {
            onRenameFail(newName);
        }

    }, [show, onRename])

    const [editingName, setEditingName] = useState<boolean>(false);

    return <div className="centered-col gap-6">

        <div className={mergeClasses(
            "w-full text-center text-4xl",
            canRename && "flex flex-row gap-2 items-center justify-center"
        )}>
            <div>{show.name}</div>
            {canRename && <AleasIconButton
                icon="Edit"
                size="Small"
                className="flex-grow-0"
                onClick={() => setEditingName(true)}
            />}

            {canRename && <AleasPopoverTextInput
                isOpen={editingName}
                onCancel={() => setEditingName(false)}
                onConfirm={async (value: string) => {
                    await onShowRename(value);
                    setEditingName(false);
                }}
                title="Renommer"
                initialValue={show.name}
                canValidate={Validators.strings.lengthBetween(3, 50)}
            >
                Indiquer un nouveau nom (entre 3 et 50 caractères)
            </AleasPopoverTextInput>}
        </div>

        <div className="centered-row gap-4">

            <div className="centered-col gap-8">
                <div className="centered-row gap-3">

                    <div className="text-lg">
                        Scenes:
                    </div>

                    {!isEmpty(show.scenes) ? 
                        <AleasDropdownButton
                            options={dropdownOptions}
                            value={scene}
                            onValueChanged={onDropdownSelectionChanged}
                            placeholder="Select a scene"
                        /> : 
                        <div>Aucune scène à afficher</div>
                    }
                    
                </div>

                <div className="flex flex-row items-center justify-center gap-3">
                    <AleasButton
                        onClick={onToggleBtnClicked}
                        disabled={!toggleBtnEnabled}
                    >
                        {isPlaying ? "Stop" : "Tester"}
                    </AleasButton>

                    <AleasButton
                        disabled={!editBtnEnabled}
                        onClick={onEditBtnClicked}
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
                        hasConfirmation
                        confirmationOptions={{
                            title: "Suppression",
                            message: "Êtes-vous certain·e de vouloir supprimer la scène ?"
                        }}
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

        </div>
    </div>
}

export default ShowEditor;