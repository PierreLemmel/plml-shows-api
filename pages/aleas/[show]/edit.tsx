import { AleasButton } from "@/components/aleas/aleas-buttons";
import AleasCheckbox from "@/components/aleas/aleas-checkbox";
import { AleasMainLayout } from "@/components/aleas/aleas-layout"
import AleasMinMaxEditor from "@/components/aleas/aleas-minmax-editor";
import AleasNumberInput from "@/components/aleas/aleas-number-input";
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import AleasSlider from "@/components/aleas/aleas-slider";
import { toast } from "@/components/aleas/aleas-toast-container";
import { getAleasShow, updateAleasShow } from "@/lib/services/aleas/aleas-api";
import { AleasAudioItemInfo, AleasDurationItemInfo, AleasSceneItemInfo } from "@/lib/services/aleas/aleas-providers";
import { AleasShow, AleasShowInfo, useAleasShowInfo } from "@/lib/services/aleas/aleas-setup";
import { replaceFirstElement } from "@/lib/services/core/arrays";
import { pathCombine } from "@/lib/services/core/files";

import { useEffectAsync } from "@/lib/services/core/hooks";
import { sum } from "@/lib/services/core/maths";
import { generateId, mergeClasses, withValue } from "@/lib/services/core/utils";
import { useShowControl, useShowInfo } from "@/lib/services/dmx/showControl";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";

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
                        const { volume, collection, duration, fadeDuration } = a;

                        return {
                            id, name, weight, canChain, active,
                            type,
                            volume,
                            duration,
                            fadeDuration,
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

    return <AleasMainLayout title="Aléas" navbar={true} requireAuth titleDisplay={false} toasts>
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
    const { intro, outro } = generation;
    
    const setAudioValue = useCallback((audioItem: AleasAudioItemInfo) => {

        const newAudio: AleasAudioItemInfo[] = replaceFirstElement(audio, (a) => a.id === audioItem.id,audioItem);
        const newShowInfo = withValue(showInfo, "providers.audio", newAudio);

        setShowValue(newShowInfo);
    }, [showInfo]);

    const setDurationValue = useCallback((duration: AleasDurationItemInfo) => {

        const newDurations: AleasDurationItemInfo[] = replaceFirstElement(durations, (d) => d.id === duration.id, duration);
        const newShowInfo = withValue(showInfo, "providers.durations", newDurations);

        setShowValue(newShowInfo);
    }, [showInfo]);

    const setSceneValue = useCallback((scene: AleasSceneItemInfo) => {

        const newScenes: AleasSceneItemInfo[] = replaceFirstElement(scenes, (s) => s.id === scene.id, scene);
        const newShowInfo = withValue(showInfo, "providers.scenes", newScenes);

        setShowValue(newShowInfo);
    }, [showInfo]);

    const totalAudioWeight = useMemo(() => sum(audio.map(a => a.active ? a.weight : 0)), [showInfo]);
    const totalDurationWeight = useMemo(() => sum(durations.map(d => d.active ? d.weight : 0)), [showInfo]);
    const totalScenesWeight = useMemo(() => sum(scenes.map(s => s.active ? s.weight : 0)), [showInfo]);

    const synchronizeAleasShow = useCallback(async () => {

        const {
            show,
            providers: {
                scenes: existingScenes
            }
        } = showInfo;

        const existingShowScenes = show.scenes;

        const updatedScenes = existingScenes
            .filter(aleasScene => {
                const exists = existingShowScenes.some(showScene => showScene.name === aleasScene.scene.name);
                
                if (!exists) {
                    toast.warn(`Scène supprimée : ${aleasScene.scene.name}`);
                }
                
                return exists;
            })

        existingShowScenes.forEach(showScene => {

            const exists = existingScenes.some(aleasScene => aleasScene.scene.name === showScene.name);
            
            if (!exists) {
                const newScene: AleasSceneItemInfo = {
                    scene: showScene,
                    active: true,
                    canChain: true,
                    weight: 10,
                    name: showScene.name,
                    id: generateId()
                }

                updatedScenes.push(newScene);
                toast.success(`Scène ajoutée : ${showScene.name}`);
            }
        })
        
        const updatedShow = withValue(showInfo, "providers.scenes", updatedScenes);
        setShowValue(updatedShow);
    }, [showInfo])

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

        <Block title="Scènes">
            {scenes.length > 0 ?
                <div className="full flex flex-col gap-6">
                    {scenes.map(item => {

                        const { 
                            id, name, weight, canChain, active,
                            
                        } = item;

                        return <div key={id} className="w-full flex flex-col items-stretch gap-4">
                            <div className="text-center text-lg">{`${name} (${active ? `${(100 * weight / totalScenesWeight).toFixed(1)}%`: "Inactif"})`}</div>

                            <div className={mergeClasses(
                                "grid content-center items-center gap-4",
                                "md:grid-cols-[auto_1fr_auto_1fr] grid-cols-[auto_1fr]",
                            )}>
                                <Label>{active ? "Actif" : "Inactif"}</Label>
                                <AleasCheckbox
                                    checked={active}
                                    onChange={checked => {
                                        const newVal = withValue(item, "active", checked);
                                        setSceneValue(newVal)
                                    }}
                                />

                                {active && <>
                                    <Label>Poids</Label>
                                    <AleasSlider
                                        value={weight}
                                        orientation="horizontal"
                                        min={0} max={100}
                                        setValue={value => {
                                            const newVal = withValue(item, "weight", value);
                                            setSceneValue(newVal)
                                        }}
                                    />

                                    <Label>{canChain ? "Chainable" : "Non chainable"}</Label>
                                    <AleasCheckbox
                                        checked={canChain}
                                        onChange={checked => {
                                            const newVal = withValue(item, "canChain", checked);
                                            setSceneValue(newVal)
                                        }}
                                    />
                                </>}

                                <Label>Scène</Label>
                                <div>
                                    <Link
                                        href={pathCombine("/show", showInfo.show.name, "scenes", "edit", item.scene.name)}
                                        className="hover:text-blue-200 hover:font-bold"
                                    >
                                        {item.scene.name}
                                    </Link>
                                </div>
                            </div>
                        </div>;
                    })}
                </div> : 
                <div className="text-center">Aucune scène</div>
            }
            
            <div className="w-full flex flex-row items-center justify-center mt-6"><AleasButton onClick={async () => await synchronizeAleasShow()}>Synchroniser</AleasButton></div>
            
        </Block>

        <Block title="Intro">
            <div className={mergeClasses(
                "w-full grid content-center items-center gap-4",
                "md:grid-cols-[auto_1fr_auto_1fr] grid-cols-[auto_1fr]",
            )}>
                <Label>Scène</Label>
                <div>
                    <Link
                        href={pathCombine("/show", showInfo.show.name, "scenes", "edit", intro.scene)}
                        className="hover:text-blue-200 hover:font-bold"
                    >
                        {intro.scene}
                    </Link>
                </div>

                <Label>Volume</Label>
                <AleasSlider
                    value={intro.volume}
                    orientation="horizontal"
                    min={0} max={1}
                    step={0.05}
                    setValue={value => {
                        const updated = withValue(showInfo, "generation.intro.volume", value);
                        setShowValue(updated)
                    }}
                />

                <Label>Durée</Label>
                <AleasMinMaxEditor
                    value={intro.duration}
                    onValueChange={value => {
                        const updated = withValue(showInfo, "generation.intro.duration", value);
                        setShowValue(updated)
                    }}
                    range={{min: 10, max: 360}}
                />

                <Label>Fade</Label>
                <AleasMinMaxEditor
                    value={intro.fadeDuration}
                    onValueChange={value => {
                        const updated = withValue(showInfo, "generation.intro.fadeDuration", value);
                        setShowValue(updated)
                    }}
                    step={0.1}
                    range={{min: 0, max: 5}}
                />
            </div>
        </Block>

        <Block title="Outro">
            <div className={mergeClasses(
                "w-full grid content-center items-center gap-4",
                "md:grid-cols-[auto_1fr_auto_1fr] grid-cols-[auto_1fr]",
            )}>
                <Label>Scène</Label>
                <div>
                    <Link
                        href={pathCombine("/show", showInfo.show.name, "scenes", "edit", outro.scene)}
                        className="hover:text-blue-200 hover:font-bold"
                    >
                        {outro.scene}
                    </Link>
                </div>

                <Label>Volume</Label>
                <AleasSlider
                    value={outro.volume}
                    orientation="horizontal"
                    min={0} max={1}
                    step={0.05}
                    setValue={value => {
                        const updated = withValue(showInfo, "generation.outro.volume", value);
                        setShowValue(updated)
                    }}
                />

                <Label>Durée</Label>
                <AleasMinMaxEditor
                    value={outro.duration}
                    onValueChange={value => {
                        const updated = withValue(showInfo, "generation.outro.duration", value);
                        setShowValue(updated)
                    }}
                    range={{min: 10, max: 360}}
                />

                <Label>Fade</Label>
                <AleasMinMaxEditor
                    value={outro.fadeDuration}
                    onValueChange={value => {
                        const updated = withValue(showInfo, "generation.outro.fadeDuration", value);
                        setShowValue(updated)
                    }}
                    step={0.1}
                    range={{min: 0, max: 5}}
                />
            </div>
        </Block>

        <Block title="Durées">
            <div className="full flex flex-col gap-6">
                {durations.map(item => {

                    const { 
                        id, name, weight, canChain, active,
                        duration, fade
                    } = item;

                    return <div key={id} className="w-full flex flex-col items-stretch gap-4">
                        <div className="text-center text-lg">{`${name} (${active ? `${(100 * weight / totalDurationWeight).toFixed(1)}%`: "Inactif"})`}</div>

                        <div className={mergeClasses(
                            "grid content-center items-center gap-4",
                            "md:grid-cols-[auto_1fr_auto_1fr] grid-cols-[auto_1fr]",
                        )}>
                            <Label>{active ? "Actif" : "Inactif"}</Label>
                            <AleasCheckbox
                                checked={active}
                                onChange={checked => {
                                    const newVal = withValue(item, "active", checked);
                                    setDurationValue(newVal)
                                }}
                            />

                            {active && <>
                                <Label>Poids</Label>
                                <AleasSlider
                                    value={weight}
                                    orientation="horizontal"
                                    min={0} max={100}
                                    setValue={value => {
                                        const newVal = withValue(item, "weight", value);
                                        setDurationValue(newVal)
                                    }}
                                />

                                <Label>{canChain ? "Chainable" : "Non chainable"}</Label>
                                <AleasCheckbox
                                    checked={canChain}
                                    onChange={checked => {
                                        const newVal = withValue(item, "canChain", checked);
                                        setDurationValue(newVal)
                                    }}
                                />
                            </>}

                            <Label>Durée</Label>
                            <AleasMinMaxEditor 
                                value={duration}
                                range={{ min: 0, max: 1800 }}
                                step={1}
                                onValueChange={value => {
                                    const newVal = withValue(item, "duration", value);
                                    setDurationValue(newVal)
                                }
                            } />

                            <Label>Fade</Label>
                            <AleasMinMaxEditor
                                value={fade}
                                range={{ min: 0, max: 60 }}
                                step={0.1}
                                onValueChange={value => {
                                    const newVal = withValue(item, "fade", value);
                                    setDurationValue(newVal)
                                }
                            } />
                            
                        </div>
                    </div>;
                })}
            </div>
        </Block>

        <Block title="Audio">
            <div className="full flex flex-col gap-6">
                {audio.map(item => {

                    const { 
                        id, name, weight, canChain, active,
                        type
                    } = item;

                    return <div key={id} className="w-full flex flex-col items-stretch gap-4">
                        <div className="text-center text-lg">{`${name} (${active ? `${(100 * weight / totalAudioWeight).toFixed(1)}%`: "Inactif"})`}</div>

                        <div className={mergeClasses(
                            "grid content-center items-center gap-4",
                            "md:grid-cols-[auto_1fr_auto_1fr] grid-cols-[auto_1fr]",
                        )}>
                            <Label>{active ? "Actif" : "Inactif"}</Label>
                            <AleasCheckbox
                                checked={active}
                                onChange={checked => {
                                    const newVal = withValue(item, "active", checked);
                                    setAudioValue(newVal)
                                }}
                            />

                            {active && <>
                                <Label>Poids</Label>
                                <AleasSlider
                                    value={weight}
                                    orientation="horizontal"
                                    min={0} max={100}
                                    setValue={value => {
                                        const newVal = withValue(item, "weight", value);
                                        setAudioValue(newVal)
                                    }}
                                />

                                <Label>{canChain ? "Chainable" : "Non chainable"}</Label>
                                <AleasCheckbox
                                    checked={canChain}
                                    onChange={checked => {
                                        const newVal = withValue(item, "canChain", checked);
                                        setAudioValue(newVal)
                                    }}
                                />
                            </>}

                            <Label>Collection</Label>
                            {type === "FromCollection" ? <div>
                                {item.collection.name}
                            </div> : <div>
                                Pas de musique
                            </div>}

                            {type === "FromCollection" && <>
                                <Label>Volume</Label>
                                <AleasMinMaxEditor
                                    value={item.volume}
                                    range={{ min: 0, max: 1 }}
                                    step={0.05}
                                    onValueChange={value => {
                                        const newVal = withValue(item, "volume", value);
                                        setAudioValue(newVal)
                                    }}
                                />

                                <Label>Durée</Label>
                                <AleasMinMaxEditor
                                    value={item.duration}
                                    range={{ min: 0, max: 180 }}
                                    step={1}
                                    onValueChange={value => {
                                        const newVal = withValue(item, "duration", value);
                                        setAudioValue(newVal)
                                    }}
                                />

                                <Label>Fade</Label>
                                <AleasMinMaxEditor
                                    value={item.fadeDuration}
                                    range={{ min: 0, max: 8 }}
                                    step={0.1}
                                    onValueChange={value => {
                                        const newVal = withValue(item, "fadeDuration", value);
                                        setAudioValue(newVal)
                                    }}
                                />
                            </>}
                        </div>
                    </div>;
                })}
            </div>
        </Block>

    </div>
}

interface BlockProps {
    children?: React.ReactNode[]|React.ReactNode,
    title: string
}

const Block = ({ children, title }: BlockProps) => <div className="w-full p-2 flex flex-col items-stretch">
    <div className="text-2xl mb-2 text-center">{title}</div>
    <div className="">
        {children}
    </div>
</div>

const Label = ({ children }: { children: string }) => <div className="min-w-[8em]">{children}</div>


export default AleasShowDisplay;