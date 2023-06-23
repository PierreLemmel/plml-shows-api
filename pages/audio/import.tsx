import { AleasButton } from "@/components/aleas/aleas-buttons";
import AleasFileUpload from "@/components/aleas/aleas-file-upload";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import { useInterval } from "@/lib/services/core/hooks";
import { useCallback, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';

const Import = () => {

    const importBtnEnabled = true;
    const onImportClicked = () => {
        console.log("Import")
    }

    const clearBtnEnabled = true;
    const onClearClicked = () => {
        
    }

    const onUpload= useCallback((files: File[]|null) => {

        if (files && files.length > 0) {
            const file = files[0];
            toast(`Fichier '${file.name}' importé`)
        }
    }, [])

    const onUploadError = useCallback((files: File[]) => {
        files.forEach(file => toast(`Impossible d'importer le fichier '${file.name}'`));
    }, []);

    return <AleasMainLayout title="Aléas - Import Audio" titleDisplay={false} toasts={true}>
        <div className="full flex flex-col items-center justify-between">
            <div>Importer un fichier Audio</div>
            <AleasFileUpload
                multiple={false}
                text="Déposez les fichiers à importer (.mp3 ou .wav)"
                accept="mp3,wav"
                onUpload={onUpload}
                onUploadError={onUploadError}
                />
            <div className="flex flex-row items-center justify-center gap-3">
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

export default Import;