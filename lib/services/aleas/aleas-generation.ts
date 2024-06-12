import { get } from "http";
import { getFixtureCollection, getLightingPlan, getShow } from "../api/show-control-api";
import { HasId, Named, ShortNamed } from "../core/types/utils";
import { notImplemented, randomElement, randomInt, randomRange, sequence } from "../core/utils";
import { DmxValueSegment, Mappings, SceneInfo, ShowInfo } from "../dmx/showControl";
import { getAudioLibraryCollection } from "./aleas-api";

export type RangeOrValue = number | [ number, number ];


export type Fade = RangeOrValue | { fadeIn: RangeOrValue, fadeOut: RangeOrValue };

export type KeyFrame = [ number, number ];

export const aleasFeatures = [
    "projections",
    "monologues",
    "confessionnal",
    "stroboscopes",
    "smokeMachine",
] as const;

export type AleasFeatures = typeof aleasFeatures[number];

export type AleasFeaturesMap = {
    [key in AleasFeatures]: boolean;
};

type GenerateAleasPrePostShowArgs = {
    scene: string;
    fade: Fade;
}

type GenerateAleasPreShowArgs = GenerateAleasPrePostShowArgs;
type GenerateAleasPostShowArgs = GenerateAleasPrePostShowArgs;

export type GenerateAleasShowArgs = {
    generation: {
        save: boolean;
    },
    show: {
        totalDuration: RangeOrValue;
        lightingPlan: string;
        showName: string;
    },
    blackout: {
        duration: RangeOrValue;
        fade?: Fade;
    }
    preshow: GenerateAleasPreShowArgs,
    postshow: GenerateAleasPostShowArgs,
    intro: {
        duration: RangeOrValue;
        scene: string;
        fade: Fade;
    },
    outro: {
        duration: RangeOrValue;
        scene: string;
        fade: Fade;
    },
    features: Partial<AleasFeaturesMap>,
}

export type GenerateAleasShowArgsValues = {
    show: {
        totalDuration: number;
    },
    blackout: {
        duration: number;
        fadeIn: number;
        fadeOut: number;
    }
    preshow: {
        fadeIn: number;
        fadeOut: number;
    },
    postshow: {
        fadeIn: number;
        fadeOut: number;
    },
    intro: {
        duration: number;
        fadeIn: number;
        fadeOut: number;
    },
    outro: {
        duration: number;
        fadeIn: number;
        fadeOut: number;
    },
}

function computeShowArgsValues(args: GenerateAleasShowArgs): GenerateAleasShowArgsValues {
    const blackoutFade = getFadeValues(args.blackout.fade);
    const preshowFade = getFadeValues(args.preshow.fade);
    const postshowFade = getFadeValues(args.postshow.fade);
    const introFade = getFadeValues(args.intro.fade);
    const outroFade = getFadeValues(args.outro.fade);

    return {
        show: {
            totalDuration: getValue(args.show.totalDuration)
        },
        blackout: {
            duration: getValue(args.blackout.duration),
            fadeIn: blackoutFade.fadeIn,
            fadeOut: blackoutFade.fadeOut
        },
        preshow: {
            fadeIn: preshowFade.fadeIn,
            fadeOut: preshowFade.fadeOut
        },
        postshow: {
            fadeIn: postshowFade.fadeIn,
            fadeOut: postshowFade.fadeOut
        },
        intro: {
            duration: getValue(args.intro.duration),
            fadeIn: introFade.fadeIn,
            fadeOut: introFade.fadeOut
        },
        outro: {
            duration: getValue(args.outro.duration),
            fadeIn: outroFade.fadeIn,
            fadeOut: outroFade.fadeOut
        }
    }
}

export type GenerationInfo = {
    generatedAt: Date;
    params: GenerateAleasShowArgs;
    values: GenerateAleasShowArgsValues;
}

export type AleasAudioLibrariesCollection = {
    libraries: AleasAudioLibrary[];
} & Named & ShortNamed & HasId;

export type AleasAudioLibrary = {
    name: string;
    key: string;
    count: number;
}

type SceneBaseInfo = {
    templateName: string;
    duration: number;
    info: string;
}

type LightsElement = {
    scene: string;
    amplitude: number;
    level: KeyFrame[];
    elements: DmxValueSegment[];
}
type LightsElementsOrNoLights = ({
    hasLights: true,
    lights: LightsElement[],
} | { hasLights: false })

type AudioElement = {
    track: string;
    startTime: number;
    duration: number;
    amplitude: number;
    volume: KeyFrame[];
}
type AudioElementsOrNoAudio = ({
    hasAudio: true,
    audio: AudioElement[]
} | { hasAudio: false })

type ProjectionElement = {
    text: string;
    startTime: number;
    duration: number;
    fadeIn: number;
    fadeOut: number;
}
type ProjectionsElementsOrNoProjections = ({
    hasProjections: true,
    projections: ProjectionElement[]
} | { hasProjections: false })

type SceneData = SceneBaseInfo
    & LightsElementsOrNoLights
    & AudioElementsOrNoAudio
    & ProjectionsElementsOrNoProjections;
export type AleasShowScene = { name: string }
    & SceneData;

type AleasShowStaticElements = {
    lights?: {
        scene: string;
        elements: DmxValueSegment[];
    }
}

type AleasPrePostShowElements = {

}

type AleasPreshowElements = AleasPrePostShowElements;
type AleasPostShowElements = AleasPrePostShowElements;

export type AleasShow = {
    generationInfo: GenerationInfo;
    static: AleasShowStaticElements;
    preshow: AleasPreshowElements;
    postshow: AleasPostShowElements;
    scenes: AleasShowScene[];
};

export const getValue = (value: RangeOrValue): number => (Array.isArray(value)) ? randomRange(value[0], value[1]) : value

export const getFadeValues = (fade: Fade|undefined): { fadeIn: number, fadeOut: number } => {
    if (fade === undefined) {
        return { fadeIn: 0, fadeOut: 0 };
    }
    else if (typeof fade === "number") {
        return { fadeIn: fade, fadeOut: fade };
    }
    else if (Array.isArray(fade)) {
        const fadeIn = randomRange(fade[0], fade[1]);
        const fadeOut = randomRange(fade[0], fade[1]);
        return { fadeIn, fadeOut };
    }
    else {
        const { 
            fadeIn: fadeInInput,
            fadeOut: fadeOutInput
        } = fade;


        const fadeIn = getValue(fadeInInput);
        const fadeOut = getValue(fadeOutInput);

        return { fadeIn, fadeOut };
    }
}

export type CalculateParamHistory = {
    elements: {
        name: string;
        duration: number;
    }[],
    counts: {
        [key: string]: number;
    }
}

export type CalculateParamValArgs = {
    totalTime: number;
    currentScene: number;
    currentTime: number;
    remainingTime: number;
    progress: number;
    history: CalculateParamHistory;
}

type ProviderOrValueInType = number|boolean|object;
type ParamProvider<T extends ProviderOrValueInType> = (args: CalculateParamValArgs) => T;
export type ParamProviderOrValue<T extends ProviderOrValueInType> = ParamProvider<T>|T;

function calculateParamVal<T extends ProviderOrValueInType>(providerOrValue: ParamProviderOrValue<T>, args: CalculateParamValArgs): T {
    return typeof providerOrValue === "function" ? providerOrValue(args) : providerOrValue;
}


export type AleasLibraryElementTemplate<T extends object> = {
    name: string;
    isPriority: ParamProviderOrValue<boolean>;
    enabled: ParamProviderOrValue<boolean>;
    weight: ParamProviderOrValue<number>;
    requiredFeatures?: AleasFeatures[];
    durationRange: ParamProviderOrValue<[number, number]>;

    value: ParamProviderOrValue<T>;
};

export type AleasLibraryElementInstatiatedTemplate<T extends object> = {
    name: string;
    isPriority: boolean;
    enabled: boolean;
    weight: number;
    durationRange: [number, number];

    value: ParamProviderOrValue<T>;
}

export type AleasSceneTemplate = AleasLibraryElementTemplate<SceneData>;
export type AleasSceneInstatiatedTemplate = AleasLibraryElementInstatiatedTemplate<SceneData>;

async function getDmxShowInfo(showName: string, lightingPlan: string) {
    const dmxShow = await getShow(lightingPlan, showName);
    const lp = await getLightingPlan(lightingPlan);
    const fixtureColl = await getFixtureCollection("default");
    const lpInfo = Mappings.computeLightingPlanInfo(lp, fixtureColl);
    const dmxShowInfo: ShowInfo = Mappings.computeShowInfo(dmxShow, lpInfo);

    return dmxShowInfo;
}

type LoadedLibrary<T> = {
    [key: string]: T;
}

type LoadedLibraries = {
    dmxScenes: LoadedLibrary<SceneInfo>;
    audioLibraries: LoadedLibrary<AleasAudioLibrary>;
}

async function loadLibraries(showName: string, lightingPlan: string): Promise<LoadedLibraries> {
    const dmxShowInfo = await getDmxShowInfo(showName, lightingPlan);
    const audioLibrary = await getAudioLibraryCollection("aleas-2024");

    const dmxScenes = dmxShowInfo.scenes.reduce((acc, scene) => {
        acc[scene.name] = scene;
        return acc;
    }, {} as LoadedLibrary<SceneInfo>);

    const audioLibraries = audioLibrary.libraries.reduce((acc, library) => {
        acc[library.key] = library;
        return acc;
    }, {} as LoadedLibrary<AleasAudioLibrary>);

    const libraries: LoadedLibraries = {
        dmxScenes,
        audioLibraries
    }

    return libraries;
}



export async function generateAleasShow(args: GenerateAleasShowArgs): Promise<AleasShow> {

    const {
        show: {
            lightingPlan,
            showName
        },
        features
    } = args;


    const argsValues = computeShowArgsValues(args);

    const {
        show: {
            totalDuration,
        },
        blackout: {
            duration: blackoutDurationValue
        },
    } = argsValues;

    
    const libraries = await loadLibraries(showName, lightingPlan);
    const templates = await getAleasSceneTemplates(libraries);


    let currentTime = 0;
    let currentScene = 0;
    const history: CalculateParamHistory = {
        elements: [],
        counts: {}
    };

    const scenes: AleasShowScene[] = [];

    while (currentTime < totalDuration) {

        const paramValArgs: CalculateParamValArgs = {
            currentTime,
            totalTime: totalDuration,
            remainingTime: totalDuration - currentTime,
            currentScene,
            progress: currentTime / totalDuration,
            history
        };

        
        const next = getNextElementFromTemplates(templates, features, paramValArgs);
        const nextScene = calculateParamVal(next.value, paramValArgs);

        history.elements.push({
            name: next.name,
            duration: nextScene.duration
        });

        history.counts[next.name] = (history.counts[next.name] || 0) + 1;

        scenes.push({
            name: `Scene-${(currentScene + 1).toString().padStart(2, "0")}`,
            ...nextScene
        });

        currentTime += nextScene.duration;
        currentTime += blackoutDurationValue;

        currentScene++;
    }

    const staticElements = getStaticElements(libraries);
    const preshow = getPreshowElements(args.preshow, libraries);
    const postshow = getPostshowElements(args.postshow, libraries);

    return {
        generationInfo: {
            generatedAt: new Date(),
            values: argsValues,
            params: args
        },
        scenes,
        static: staticElements,
        preshow,
        postshow,
    }
}

function getNextElementFromTemplates<T extends object>(templates: AleasLibraryElementTemplate<T>[], features: Partial<AleasFeaturesMap>, args: CalculateParamValArgs): AleasLibraryElementInstatiatedTemplate<T> {
    const instantiatedTemplates: AleasLibraryElementInstatiatedTemplate<T>[] = templates
        .filter(template => {
            const {
                requiredFeatures = []
            } = template;
            
            return requiredFeatures.every(feature => features[feature] === true);
        })
        .map(template => {
            const {
                name,
                isPriority,
                enabled,
                weight,
                value,
                durationRange
            } = template;

            return {
                name,
                isPriority: calculateParamVal(isPriority, args),
                enabled: calculateParamVal(enabled, args),
                weight: calculateParamVal(weight, args),
                durationRange: calculateParamVal(durationRange, args),
                value
            }
        })
        .filter(template => template.enabled);

    if (instantiatedTemplates.length === 0) {
        throw new Error("No templates remaining");
    }

    const priorities = instantiatedTemplates.filter(template => template.isPriority);

    if (priorities.length > 0) {
        if (priorities.length === 1) {
            return priorities[0];
        }
        else {
            throw new Error("Multiple priorities found");
        }
    }

    const totalWeight = instantiatedTemplates.reduce((acc, template) => acc + template.weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;

    for (const template of instantiatedTemplates) {
        currentWeight += template.weight;
        if (random <= currentWeight) {
            return template;
        }
    }

    throw new Error("No template found");
}

async function getAleasSceneTemplates(libraries: LoadedLibraries): Promise<AleasSceneTemplate[]> {
    return getImproEnSeineSceneTemplates(libraries);
}

function getRandomSceneFromScenes(libraries: string[][]): string {
    const scenes = randomElement(libraries);
    return randomElement(scenes);
}

function getValuesFromScene(library: LoadedLibrary<SceneInfo>, scene: string): DmxValueSegment[] {
    const sceneInfo = library[scene];

    if (!sceneInfo) {
        throw new Error(`Scene ${scene} not found`);
    }

    const segments = sceneInfo.elements.map(element => {

        const {
            rawValues,
            fixture: {
                address
            }
        } = element;
        
        return {
            address,
            values: rawValues
        }
    });

    return segments;
}

function getRandomElementFromAudioLib(libraries: LoadedLibrary<AleasAudioLibrary>, ...libs: string[]): string {
    const libName = randomElement(libs);
    const lib = libraries[libName];
    const index = randomInt(0, lib.count);

    return `${libName}-${(index + 1).toString().padStart(2, "0")}`;
}

function getRandomDuration(...durations: [number, number][]): number {
    const range = randomElement(durations);
    const duration = randomRange(range[0], range[1]);
    return duration;
}

function getRandomDurationRange(...durations: [number, number][]): [number, number] {
    const min = Math.min(...durations.map(d => d[0]));
    const max = Math.max(...durations.map(d => d[1]));

    return [min, max];
}

type HardCodedTemplateParts = {
    getBaseInfo: (args: CalculateParamValArgs) => SceneBaseInfo;
    getLights: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries) => LightsElementsOrNoLights;
    getAudio?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries) => AudioElementsOrNoAudio;
    getProjection?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries) => ProjectionsElementsOrNoProjections;
}

function makeSceneProvider(parts: HardCodedTemplateParts, libraries: LoadedLibraries): ParamProvider<SceneData> {

    const {
        getBaseInfo,
        getLights,
        getAudio = () => ({ hasAudio: false }),
        getProjection = () => ({ hasProjections: false })
    } = parts;

    return (args: CalculateParamValArgs) => {
        const baseInfo = getBaseInfo(args);
        const { duration } = baseInfo;

        return {
            ...baseInfo,
            ...getLights(args, duration, libraries),
            ...getAudio(args, duration, libraries),
            ...getProjection(args, duration, libraries)
        }
    }
}

function getStaticElements(libraries: LoadedLibraries): AleasShowStaticElements {
    return getImproEnSeineStaticElements(libraries);
}

function getPreshowElements(args: GenerateAleasPreShowArgs, libraries: LoadedLibraries): AleasPreshowElements {
    return getImproEnSeinePreshowElements(args, libraries);
}

function getPostshowElements(args: GenerateAleasPostShowArgs, libraries: LoadedLibraries): AleasPostShowElements {
    return getImproEnSeinePostshowElements(args, libraries);
}


function getImproEnSeineSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {

    const factories: ((libraries: LoadedLibraries) => AleasSceneTemplate)[] = Object.values(improEnSeine.templates);

    const templates = factories.map(factory => factory(libraries));
    return templates;
};

type CreateLevelArgs = {
    duration: number;
    fadeIn: number;
    fadeOut: number;
    offset?: number;
    level?: number;
}

function createStandardLevel(args: CreateLevelArgs): KeyFrame[] {

    const {
        duration,
        fadeIn,
        fadeOut,
        offset = 0,
        level = 1.0
    } = args;

    return [
        [offset + 0.0, 0.0],
        [offset + fadeIn, level],
        [offset + duration - fadeOut, level],
        [offset + duration, 0.0]
    ];
}

type GenerateAudioElementsArgs = {
    sceneDuration: number;
    audioDurationRange: [number, number];
    fadeDurationRange: [number, number];
    amplitude: number;
    startEndMargin: number;
    minSpaceBetweenAudio: number;
    occurencesCap?: number;
    audioLibraries: string[];
}

function generateAudioElements(libraries: LoadedLibraries, args: GenerateAudioElementsArgs): AudioElement[] {

    const {
        sceneDuration,
        audioDurationRange,
        fadeDurationRange,
        amplitude,
        startEndMargin,
        minSpaceBetweenAudio,
        audioLibraries,
        occurencesCap = 1000
    } = args;

    const maxAudioDuration = audioDurationRange[1];

    const fade = randomRange(fadeDurationRange[0], fadeDurationRange[1]);

    const remainingTimeAfterMaxDuration = sceneDuration - maxAudioDuration - startEndMargin * 2;
    const maxOccurences = Math.min(
        1 + Math.floor(remainingTimeAfterMaxDuration / (minSpaceBetweenAudio + maxAudioDuration)),
        occurencesCap
    );

    const occurences = randomInt(1, maxOccurences);

    const track = getRandomElementFromAudioLib(libraries.audioLibraries, ...audioLibraries);

    const audioElements: AudioElement[] = [];

    let currentLowerBound = startEndMargin;
    for (let i = 0 ; i < occurences ; i++) {

        const eltDuration = randomRange(audioDurationRange[0], audioDurationRange[1]);

        const remainingOccurences = occurences - (i + 1);

        const startTimeLB = currentLowerBound;
        const startTimeUB = sceneDuration - startEndMargin - remainingOccurences * (minSpaceBetweenAudio + maxAudioDuration);
        const startTime = randomRange(startTimeLB, startTimeUB);

        audioElements.push({
            track,
            startTime,
            duration: eltDuration,
            amplitude,
            volume: createStandardLevel({
                duration: eltDuration,
                fadeIn: fade,
                fadeOut: fade,
                offset: startTime,
            })
        });

        currentLowerBound = startTime + eltDuration + minSpaceBetweenAudio;
    }

    return audioElements;
}


const improEnSeine = {
    templates: {
        "simple-standard-duration": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "simple-standard-duration";
            const templateInfo = "Simple scene with basic lights and standard duration";

            const availableDurations = [
                improEnSeine.durations.short,
                improEnSeine.durations.standard,
            ];

            const durationRange = getRandomDurationRange(...availableDurations);
            const availableScenes: string[][] = [
                improEnSeine.scenes.standardScenes
            ];

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number): LightsElementsOrNoLights => {
        
                const fadeIn = randomRange(1, 6);
                const fadeOut = randomRange(1, 6);

                const scene = getRandomSceneFromScenes(availableScenes);
        
                const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

                const level = createStandardLevel({
                    duration,
                    fadeIn,
                    fadeOut,
                });

                return {
                    hasLights: true,
                    lights: [
                        {
                            scene,
                            amplitude: 1.0,
                            level,
                            elements: valueSegments
                        }
                    ]
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: true,
                weight: 10,
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                }, libraries),
                durationRange
            }
        },
        "simple-with-music": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "simple-with-music";
            const templateInfo = "Simple scene with basic lights, standard duration and music";

            const availableDurations = [
                improEnSeine.durations.standard,
            ];

            const durationRange = getRandomDurationRange(...availableDurations);
            const availableScenes: string[][] = [
                improEnSeine.scenes.standardScenes
            ];

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
        
                const fadeIn = randomRange(2, 6);
                const fadeOut = randomRange(2, 6);

                const scene = getRandomSceneFromScenes(availableScenes);
        
                const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

                const level = createStandardLevel({
                    duration,
                    fadeIn,
                    fadeOut,
                });

                return {
                    hasLights: true,
                    lights: [
                        {
                            scene,
                            amplitude: 1.0,
                            level,
                            elements: valueSegments
                        }
                    ]
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const audio = generateAudioElements(libraries, {
                    sceneDuration: duration,
                    audioDurationRange: [20, 60],
                    fadeDurationRange: [1.5, 3.0],
                    amplitude: 0.5,
                    startEndMargin: 10,
                    minSpaceBetweenAudio: 40,
                    audioLibraries: ["aleas-general"]
                });

                return {
                    hasAudio: true,
                    audio
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: true,
                weight: 25,
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "projection-input": function(libraries: LoadedLibraries): AleasSceneTemplate {
            return notImplemented();
        },
        "confessionnal": function(libraries: LoadedLibraries): AleasSceneTemplate {
            return notImplemented();
        },
        "crudes": function(libraries: LoadedLibraries): AleasSceneTemplate {
            return notImplemented();
        },
        "crudes-alternates": function(libraries: LoadedLibraries): AleasSceneTemplate {
            return notImplemented();
        },
        "ultra-short": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "ultra-short";
            const templateInfo = "Scene with ultra short duration";
            
            const availableDurations = [
                improEnSeine.durations.ultraShort
            ];
            const durationRange = getRandomDurationRange(...availableDurations);
            
            const availableScenes: string[][] = [
                improEnSeine.scenes.standardScenes,
                improEnSeine.scenes.crudes,
                improEnSeine.scenes.specials,
                improEnSeine.scenes.ambients.fullColor,
                improEnSeine.scenes.ambients.bicolor,
            ];

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number): LightsElementsOrNoLights => {
        
                const fadeIn = randomRange(1, 3);
                const fadeOut = randomRange(0.2, 0.8);

                const scene = getRandomSceneFromScenes(availableScenes);
        
                const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

                const level = createStandardLevel({
                    duration,
                    fadeIn,
                    fadeOut,
                });

                return {
                    hasLights: true,
                    lights: [
                        {
                            scene,
                            amplitude: 1.0,
                            level,
                            elements: valueSegments
                        }
                    ]
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        currentScene,
                        history
                    } = args;

                    const occurences = history.counts[templateName] || 0;
                    

                    return progress > 0.18
                        && currentScene > 3
                        && progress < 0.9;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        history
                    } = args;

                    const occurences = history.counts[templateName] || 0;
                    const base = 10;

                    return progress; 
                },
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                }, libraries),
                durationRange
            }
        },
        "run-boy-run": function(libraries: LoadedLibraries): AleasSceneTemplate {
            return notImplemented();
        },
        "pf-bascule-ambient": function(libraries: LoadedLibraries): AleasSceneTemplate {
            return notImplemented();
        },
        "pf-bascule-isolation": function(libraries: LoadedLibraries): AleasSceneTemplate {
            return notImplemented();
        }
    } satisfies { [key: string]: (libraries: LoadedLibraries) => AleasSceneTemplate },
    scenes: {
        public: "public",
        static: "static",
        intro: {
            base: "intro-outro-base",
            elements: [
                "intro-outro-01",
                "intro-outro-02",
                "intro-outro-03",
                "intro-outro-04",
                "intro-outro-05",
            ]
        },
        outro: {
            base: "intro-outro-base",
            elements: [
                "intro-outro-01",
                "intro-outro-02",
                "intro-outro-03",
                "intro-outro-04",
                "intro-outro-05",
            ]
        },
        confessionnal: "confessionnal",
        standardScenes: [
            "faces-chaudes",
            "faces-froides",
            "pf chaud",
            "pf froid",
        ],
        standardAlternates: [
            [
                "chaud-jar",
                "chaud-cour"
            ],
            [
                "froid-jar",
                "froid-cour"
            ]
        ],
        smoke: "smoke",
        isolations: [
            "douche-centrale",
        ],
        crudes: [
            "diag-jar-cour",
            "diag-cour-jar",
            "rasant-jar",
            "rasant-cour",
        ],
        specials: [
            "double-diag",
            "double-douches",
            "face-fond-bleu",
        ],
        crudesAlternates: [
            [
                "diag-jar-cour",
                "diag-cour-jar",
            ],
            [
                "rasant-jar",
                "rasant-cour",
            ],
            [
                "lateraux-chaud-jar",
                "lateraux-chaud-cour",
            ]
        ],
        douches: {
            base: "douches-base",
            beam: "douches-beam",
            elements: [
                "douche-01",
                "douche-02",
                "douche-03",
            ]
        },
        ambients: {
            fullColor: sequence(12, 1).map(i => `full-color-${i.toString().padStart(2, "0")}`),
            bicolor: sequence(12, 1).map(i => `ambient-bicolor-${i.toString().padStart(2, "0")}`),
        }
    },
    durations: {
        ultraShort: [5, 12],
        short: [30, 80],
        standard: [90, 450],
        long: [500, 900],
    } satisfies { [key: string]: [number, number] }
}

function getImproEnSeineStaticElements(libraries: LoadedLibraries): AleasShowStaticElements {

    return {
        lights: {
            scene: "static",
            elements: getValuesFromScene(libraries.dmxScenes, "static")
        }
    }
}

function getImproEnSeinePreshowElements(args: GenerateAleasPreShowArgs, libraries: LoadedLibraries): AleasPreshowElements {
    
    return {

    }
}

function getImproEnSeinePostshowElements(args: GenerateAleasPostShowArgs, libraries: LoadedLibraries): AleasPostShowElements {
    return {
        
    }
}
