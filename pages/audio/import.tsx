import { AleasButton } from "@/components/aleas/aleas-buttons";
import AleasFileUpload from "@/components/aleas/aleas-file-upload";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasNumberInput from "@/components/aleas/aleas-number-input";
import AleasTagsField from "@/components/aleas/aleas-tags-field";
import AleasTextField from "@/components/aleas/aleas-textfield";
import { toast } from "@/components/aleas/aleas-toast-container";
import AleasAudioPlayer from "@/components/audio/aleas-audio-player";
import { withLogin } from "@/lib/middlewares/withLogin";
import { match, mergeClasses } from "@/lib/services/core/utils";
import { useCallback, useMemo, useState } from "react";

type DisplayState = "AudioImport"|"AudioEditSettings"|"AudioEditKeypoints";


const Import = () => {

    const [displayState, setDisplayState] = useState<DisplayState>("AudioImport");

    const importBtnEnabled = useMemo<boolean>(() => {
        return true;
    }, []);
    const onImportClicked = useCallback(() => {
        console.log("Import")
    }, [])

    const clearBtnEnabled = useMemo<boolean>(() => {
        return true;
    }, []);
    const onClearClicked = useCallback(() => {
        
    }, []);

    const [audioFile, setAudioFile] = useState<File>();

    const onUpload = useCallback((files: File[]|null) => {

        if (files && files.length > 0) {
            const file = files[0];
            toast(`Fichier '${file.name}' importé`)
            setAudioFile(file);
            setDisplayState("AudioEditSettings")
        }
    }, [setAudioFile, setDisplayState])

    const onUploadError = useCallback((files: File[]) => {
        files.forEach(file => toast(`Impossible d'importer le fichier '${file.name}'`));
    }, []);

    const [name, setName] = useState<string>("Music");
    const [tempo, setTempo] = useState<number>(120);
    const [signature, setSignature] = useState<string>("4 / 4");

    const [categories, setCategories] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const categorieTags = useMemo(() => ["Relaxante", "Rage", "Contemplative", "Positive", "Beats"], []);

    return <AleasMainLayout title="Aléas - Import Audio" titleDisplay={false} toasts={true}>
        <div className="full flex flex-col items-stretch justify-between gap-4">
            <div className="text-center flex-grow-0">Importer un fichier Audio</div>
            {match(displayState, {
                "AudioImport": <>
                    <div className="center-child">
                        <AleasFileUpload
                            multiple={false}
                            text="Déposez les fichiers à importer (.mp3 ou .wav)"
                            accept="mp3,wav"
                            onUpload={onUpload}
                            onUploadError={onUploadError}
                        />
                    </div>
                </>,
                "AudioEditSettings": <>
                    <div className="w-full flex-grow">
                        <div className="w-full max-h-[60vh] overflow-y-auto flex flex-col gap-8 pr-3">
                            <div className={mergeClasses(
                                "grid grid-cols-2 auto-rows-min gap-2 place-items-center",
                                "w-full fit-content",
                            )}>
                                <div>Nom :</div>
                                <AleasTextField value={name} onValueChange={setName} />

                                <div>Tempo :</div>
                                <AleasNumberInput value={tempo} onValueChange={setTempo} min={1} max={300} />

                                <div>Signature :</div>
                                <AleasTextField value={signature} onValueChange={setSignature} />

                                <div> Categories :</div>
                                <AleasTagsField
                                    tags={categories}
                                    tagOptions={categorieTags}
                                    onTagsChange={setCategories}
                                />

                                <div>Tags :</div>
                                <AleasTagsField tags={tags} onTagsChange={setTags} />
                            </div>
                        
                            {audioFile && <AleasAudioPlayer audioFile={audioFile} />}
                        </div>
                    </div>
                </>,
                "AudioEditKeypoints": <>
                    <div>EDIT KEY POINTS</div>
                </>
            })}
        
            <div className="flex flex-row flex-grow-0 items-center justify-center gap-3">
                <AleasButton onClick={onImportClicked} disabled={!importBtnEnabled}>
                    Importer
                </AleasButton>
                <AleasButton onClick={onClearClicked} disabled={!clearBtnEnabled}>
                    Effacer
                </AleasButton>
            </div>
        </div>
    </AleasMainLayout>
}

export default withLogin(Import);