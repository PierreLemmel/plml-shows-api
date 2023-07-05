import AleasCheckbox from "@/components/aleas/aleas-checkbox";
import { AleasMainLayout } from "@/components/aleas/aleas-layout"
import AleasNumberInput from "@/components/aleas/aleas-number-input";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import AleasSlider from "@/components/aleas/aleas-slider";
import { getAleasShow, updateAleasShow } from "@/lib/services/aleas/aleas-api";
import { AleasAudioItemInfo } from "@/lib/services/aleas/aleas-providers";
import { useAleasRuntime } from "@/lib/services/aleas/aleas-runtime";
import { AleasShow, AleasShowInfo, useAleasShowInfo } from "@/lib/services/aleas/aleas-setup";
import { getShow } from "@/lib/services/api/show-control-api";
import { replaceFirstElement } from "@/lib/services/core/arrays";
import { pathCombine } from "@/lib/services/core/files";

import { useEffectAsync } from "@/lib/services/core/hooks";
import { mergeClasses, withValue } from "@/lib/services/core/utils";
import { useShowControl, useShowInfo } from "@/lib/services/dmx/showControl";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, useCallback, useEffect, useState } from "react";

const AleasShowDisplay = () => {

    const showControl = useShowControl();
    
    const router = useRouter();
    const showName = router.query["show"] as string|undefined;

    const showInfo = useShowInfo();

    const [aleasShow, setAleasShow] = useState<AleasShow|null>(null);
    const aleasShowInfo = useAleasShowInfo(aleasShow, showInfo);

    useEffectAsync(async () => {

        if (showName) {
            const show = await getAleasShow(showName)
            setAleasShow(show);
        }
        
    }, [showName])

    useEffect(() => {

        if (aleasShow) {
            showControl.loadShow(aleasShow.showName)
        }
    }, [aleasShow?.showName])

    const updateShowInfo = useCallback(async (newShowInfo: AleasShowInfo) => {
        const {
            name,
            id,
            show,
            generation,
            providers: {
                scenes,
                audio,
                durations
            }
        } = newShowInfo;
        
        const aleasShow: AleasShow = {
            name,
            id,
            showName: show.name,
            generation: generation,
            providers: {
                scenes: scenes.map(s => {

                    const {
                        id, name, weight, canChain, active
                    } = s;

                    return {
                        id, name, weight, canChain, active,
                        sceneName: s.scene.name
                    }
                }),
                audio: audio.map(a => {

                    const {
                        id, name, weight, canChain, active,
                        type, 
                    } = a;

                    if (type === "NoAudio") {
                        return {
                            id, name, weight, canChain, active,
                            type
                        }
                    }
                    else {
                        const { volume, collection } = a;

                        return {
                            id, name, weight, canChain, active,
                            type,
                            volume: volume,
                            collectionName: collection.name,
                        }
                    }
                }),
                durations: durations
            },
        }

        setAleasShow(aleasShow);
        await updateAleasShow(aleasShow);
    }, [])

    return <AleasMainLayout title="Aléas" navbar={true} requireAuth titleDisplay={false}>
        <div className={mergeClasses(
            "full overflow-auto max-h-[70vh]"
        )}>
            {aleasShowInfo ?
                <AleasShowInfoDisplay showInfo={aleasShowInfo} setShowValue={updateShowInfo} /> :
                <div className="full center-child p-12">
                    <AleasSkeletonLoader lines={8} className="gap-4" />
                </div>
            }
        </div>
    </AleasMainLayout>
}

interface ShowDisplayProps {
    showInfo: AleasShowInfo;
    setShowValue: Dispatch<AleasShowInfo>
}

const AleasShowInfoDisplay = (props: ShowDisplayProps) => {
    const {
        showInfo,
        setShowValue
    } = props;

    const {
        name,
        show,
        generation,
        providers: {
            audio,
            scenes,
            durations
        }
    } = showInfo;
    
    const setAudioValue = useCallback((audioItem: AleasAudioItemInfo) => {

        const newAudio: AleasAudioItemInfo[] = replaceFirstElement(audio, (a) => a.id === audioItem.id,audioItem);
        const newShowInfo = withValue(showInfo, "providers.audio", newAudio);
        setShowValue(newShowInfo);
    }, [showInfo]);

    return <div className={mergeClasses(
        "flex flex-col items-center justify-center gap-4"
    )}>
        <div className="text-xl">{name}</div>

        <Block title="Spectacle associé">
            
            {show.name} : <Link
                className="hover:text-blue-200 hover:font-bold"
                href={pathCombine('/show/', show.name)}
            >
                éditer
            </Link>
            
        </Block>

        <Block title="Génération">
            <div className={mergeClasses(
                "grid gap-3 items-center",
                "md:grid-cols-[auto_1fr_auto_1fr] grid-cols-[auto_1fr]"
            )}>
                <div>Blackout</div>
                <AleasNumberInput
                    min={0} max={10}
                    step={0.1}
                    value={generation.blackoutDuration}
                    onValueChange={bod => {
                        const newShowInfo = withValue(showInfo, "generation.blackoutDuration", bod);
                        setShowValue(newShowInfo);
                    }}
                />
                
                <div>Durée (en secondes)</div>
                <AleasNumberInput
                    min={0}
                    step={30}
                    value={generation.showDuration}
                    onValueChange={bod => {
                        const newShowInfo = withValue(showInfo, "generation.showDuration", bod);
                        setShowValue(newShowInfo);
                    }}
                />
            </div>
        </Block>

        <Block title="Audio">
            <div className="full flex flex-col gap-6">
                {audio.map(a => {

                    const { 
                        id, name, weight, canChain, active,
                    } = a;

                    

                    return <div className="w-full flex flex-col items-stretch gap-4">
                        <div className="text-center text-lg">{`${name} (${active ? "": ""})`}</div>

                        <div key={id} className={mergeClasses(
                            "grid content-center items-center gap-4",
                            "md:grid-cols-[auto_1fr_auto_1fr] grid-cols-[auto_1fr]",
                        )}>
                            <div>{a.active ? "Actif" : "Inactif"}</div>
                            <AleasCheckbox
                                checked={active}
                                onChange={checked => {
                                    const newVal = withValue(a, "active", checked);
                                    setAudioValue(newVal)
                                }}
                            />

                            <div>Poids</div>
                            <AleasSlider
                                value={weight}
                                orientation="horizontal"
                                min={0} max={100}
                                setValue={value => {
                                    const newVal = withValue(a, "weight", value);
                                    setAudioValue(newVal)
                                }}
                            />

                            <div>{a.canChain ? "Chainable" : "Non chainable"}</div>
                            <AleasCheckbox
                                checked={canChain}
                                onChange={checked => {
                                    const newVal = withValue(a, "canChain", checked);
                                    setAudioValue(newVal)
                                }}
                            />

                            <div>Collection</div>
                            {a.type === "FromCollection" ? <div>
                                {a.collection.name}
                            </div> : <div>
                                Pas de musique
                            </div>}
                        </div>
                    </div>;
                })}
                <div>{JSON.stringify(audio)}</div>
                <div>{JSON.stringify(scenes)}</div>
                <div>{JSON.stringify(durations)}</div>
            </div>
        </Block>

    </div>
}

interface BlockProps {
    children?: React.ReactNode[]|React.ReactNode,
    title: string
}

const Block = ({ children, title }: BlockProps) => <div className="w-full p-2 flex flex-col items-stretch">
    <div className="text-lg mb-2 text-center">{title}</div>
    <div className="">
        {children}
    </div>
</div>


export default AleasShowDisplay;