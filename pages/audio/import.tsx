import { AleasButton } from "@/components/aleas/aleas-buttons";
import AleasFileUpload from "@/components/aleas/aleas-file-upload";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasNumberInput from "@/components/aleas/aleas-number-input";
import AleasTagsField from "@/components/aleas/aleas-tags-field";
import AleasTextField from "@/components/aleas/aleas-textfield";
import { toast } from "@/components/aleas/aleas-toast-container";
import AleasAudioPlayer from "@/components/audio/aleas-audio-player";
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

    return <AleasMainLayout title="Aléas - Import Audio" titleDisplay={false} toasts={true}>
        <div className="full flex flex-col items-stretch">
            <div className="text-center">Importer un fichier Audio</div>
            {match(displayState, {
                "AudioImport": <>
                    <AleasFileUpload
                        multiple={false}
                        text="Déposez les fichiers à importer (.mp3 ou .wav)"
                        accept="mp3,wav"
                        onUpload={onUpload}
                        onUploadError={onUploadError}
                    />
                </>,
                "AudioEditSettings": <>
                    <div className="w-full h-max flex-grow overflow-y-auto bg-red-400">
                        <div className={mergeClasses(
                            "grid grid-cols-2 grid-rows-5 gap-2 place-items-center",
                            "w-full",
                        )}>
                            <div>Nom :</div>
                            <AleasTextField value={name} onValueChange={setName} />

                            <div>Tempo :</div>
                            <AleasNumberInput value={tempo} onValueChange={setTempo} min={1} max={300} />

                            <div>Signature :</div>
                            <AleasTextField value={signature} onValueChange={setSignature} />

                            <div> Categories :</div>
                            <AleasTagsField tags={categories} onTagsChange={setCategories} />

                            <div>Tags :</div>
                            <AleasTagsField tags={tags} onTagsChange={setTags} />
                        </div>
                    </div>

                    {audioFile && <AleasAudioPlayer audioFile={audioFile} />}
                </>,
                "AudioEditKeypoints": <>
                    <div>EDIT KEY POINTS</div>
                </>
            })}
        </div>
        <div className="flex flex-row items-center justify-center gap-3">
            <AleasButton onClick={onImportClicked} disabled={!importBtnEnabled}>
                Importer
            </AleasButton>
            <AleasButton onClick={onClearClicked} disabled={!clearBtnEnabled}>
                Effacer
            </AleasButton>
        </div>
    </AleasMainLayout>
}

export default Import;