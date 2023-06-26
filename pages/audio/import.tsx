import { AleasButton } from "@/components/aleas/aleas-buttons";
import AleasFileUpload from "@/components/aleas/aleas-file-upload";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import { toast } from "@/components/aleas/aleas-toast-container";
import AleasAudioPlayer from "@/components/audio/aleas-audio-player";
import { match } from "@/lib/services/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

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

    return <AleasMainLayout title="Aléas - Import Audio" titleDisplay={false} toasts={true}>
        <div className="full flex flex-col items-center justify-between">
            <div>Importer un fichier Audio</div>
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
                    <div>EDIT SETTINGS</div>
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