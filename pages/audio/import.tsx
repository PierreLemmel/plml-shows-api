import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasDropdownButton, AleasDropdownInput, DropdownOption } from "@/components/aleas/aleas-dropdowns";
import AleasFileUpload from "@/components/aleas/aleas-file-upload";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import AleasNumberInput from "@/components/aleas/aleas-number-input";
import AleasTagsField from "@/components/aleas/aleas-tags-field";
import AleasTextField from "@/components/aleas/aleas-textfield";
import { toast } from "@/components/aleas/aleas-toast-container";
import AleasAudioPlayer, { AudioPlayerRef } from "@/components/audio/aleas-audio-player";
import { withLogin } from "@/lib/middlewares/withLogin";
import { importAudioClip } from "@/lib/services/api/audio";
import { AudioClipInfo } from "@/lib/services/audio/audioControl";
import MusicSignatureEditor from "@/lib/services/audio/music-signature-editor";
import { match, mergeClasses } from "@/lib/services/core/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DisplayState = "AudioImport"|"AudioEditSettings"|"AudioEditKeypoints";


const Import = () => {

    const [displayState, setDisplayState] = useState<DisplayState>("AudioImport");

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

    const [author, setAuthor] = useState<string|undefined>(undefined);

    const sources = useMemo(() => ["AIVA", "Soundraw", "Human"], []);
    const sourceOptions = useMemo<DropdownOption<string>[]>(() => sources.map(source => ({ label: source, value: source })), [sources]);
    const [source, setSource] = useState<DropdownOption<string>>(sourceOptions[0]);

    const categorieTags = useMemo(() => ["Relaxante", "Rage", "Contemplative", "Positive", "Beats"], []);

    const reset = useCallback(() => {
        setName("");
        setTempo(120);
        setSignature("4 / 4");

        setCategories([]);
        setTags([]);

        setAuthor(undefined);
    }, []);

    useEffect(() => reset(), []);

    const [isImporting, setIsImporting] = useState<boolean>(false)
    const importBtnEnabled = (audioFile !== undefined) && !isImporting;
    const onImportClicked = useCallback(async () => {
        if (!audioFile) {
            return;
        }

        try {
            const clipInfo: AudioClipInfo = {
                duration: audioPlayerRef?.current?.duration ?? 0,
                tempo,
                signature,
                source: source.value,
                categories: [],
                tags: []
            }

            setIsImporting(true);
            await importAudioClip(audioFile, name, clipInfo)
            toast("Fichier audio importé !");
            setIsImporting(false);
            reset();
        }
        catch (e) {
            toast(e as string);
        }
    }, [audioFile, tempo, signature, source.value, categories, tags])

    const clearBtnEnabled = audioFile !== undefined;
    const onClearClicked = useCallback(() => {
        reset();
        setAudioFile(undefined);
    }, [reset]);

    const audioPlayerRef = useRef<AudioPlayerRef>(null);

    return <AleasMainLayout title="Aléas - Import Audio" titleDisplay={false} toasts={true}>
        <div className="full flex flex-col items-stretch justify-between gap-8">
            <div className="text-center text-4xl flex-grow-0">Importer un fichier Audio</div>
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
                                "grid gap-2 place-items-center",
                                "lg:grid-cols-[auto_1fr_auto_1fr] grid-cols-[auto_1fr] auto-rows-min",
                                "w-full fit-content",
                            )}>
                                <Label>Nom :</Label>
                                <AleasTextField value={name} onValueChange={setName} />

                                <Label>Tempo :</Label>
                                <AleasNumberInput value={tempo} onValueChange={setTempo} min={1} max={300} />

                                <Label>Signature :</Label>
                                <MusicSignatureEditor signature={signature} onSignatureChange={setSignature} />

                                <Label>Source :</Label>
                                <AleasDropdownInput
                                    value={source}
                                    onSelectedOptionChanged={setSource}
                                    options={sourceOptions}
                                />

                                {source?.value === "Human" && <>
                                    <Label>Auteur :</Label>
                                    <AleasTextField value={author || ""} onValueChange={setAuthor} />
                                </>}

                                <Label> Categories :</Label>
                                <AleasTagsField
                                    tags={categories}
                                    tagOptions={categorieTags}
                                    onTagsChange={setCategories}
                                />

                                <Label>Tags :</Label>
                                <AleasTagsField tags={tags} onTagsChange={setTags} />
                            </div>
                        
                            {audioFile && <AleasAudioPlayer ref={audioPlayerRef} audioFile={audioFile} />}
                        </div>
                    </div>
                </>,
                "AudioEditKeypoints": <>
                    <div>EDIT KEY POINTS - UNIMPLEMENTED YET</div>
                </>
            })}
        
            <div className="flex flex-row flex-grow-0 items-center justify-center gap-3">
                <AleasButton
                    onClick={onImportClicked}
                    disabled={!importBtnEnabled}
                    spinning={isImporting}
                >
                    Importer
                </AleasButton>
                <AleasButton onClick={onClearClicked} disabled={!clearBtnEnabled}>
                    Effacer
                </AleasButton>
            </div>
        </div>
    </AleasMainLayout>
}

const Label = ({ children }: { children: string }) => <div className="text-xl font-bold">
    {children}
</div>

export default withLogin(Import);