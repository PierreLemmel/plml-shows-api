import { getFixtureCollection, getLightingPlan, getShow } from "../api/show-control-api";
import { HasId, Named, ShortNamed } from "../core/types/utils";
import { randomElement, randomInt, randomRange } from "../core/utils";
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

type LightsElementsOrNoLights = ({
    hasLights: true,
    lights: {
        scene: string;
        amplitude: number;
        level: KeyFrame[];
        elements: DmxValueSegment[];
    }[],
} | { hasLights: false })

type AudioElementsOrNoAudio = ({
    hasAudio: true,
    audio: {
        track: string;
        startTime: number;
        duration: number;
        amplitude: number;
        volume: KeyFrame[];
    }[]
} | { hasAudio: false })

type ProjectionsElementsOrNoProjections = ({
    hasProjections: true,
    projections: {
        text: string;
        startTime: number;
        duration: number;
        fadeIn: number;
        fadeOut: number;
    }[]
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
    value: ParamProviderOrValue<T>;
};

export type AleasLibraryElementInstatiatedTemplate<T extends object> = {
    name: string;
    isPriority: boolean;
    enabled: boolean;
    weight: number;

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

const oldSampleScenes: any[] = [
    {
        name: "Scene-01",
        duration: 58.2,
        info: "Test scene with projections, audio and lights",
        hasLights: true,
        lights: [
            {
                scene: "testDmxScene",
                amplitude: 1.0,
                level: [
                    [0.0, 0.0],
                    [4.2, 1.0],
                    [54.0, 1.0],
                    [58.2, 0.0]
                ],
                elements: [
                    {
                        address: 1,
                        values: [255, 0, 255, 0, 255, 0]
                    },
                    {
                        address: 7,
                        values: [0, 255, 255, 0, 255, 0]
                    },
                    {
                        address: 13,
                        values: [50]
                    },
                    {
                        address: 14,
                        values: [50]
                    },
                    {
                        address: 15,
                        values: [50]
                    },
                    {
                        address: 16,
                        values: [50]
                    },
                ]
            },
        ],
        hasAudio: true,
        audio: [
            {
                track: "beat1",
                startTime: 12.0,
                duration: 30.0,
                amplitude: 0.85,
                volume: [
                    [ 0.0, 0.0 ],
                    [ 4.5, 0.7 ],
                    [ 12, 0.7 ],
                    [ 13.5, 1.0 ],
                    [ 20.3, 1.0 ],
                    [ 22.0, 0.3 ],
                    [ 28.0, 0.3 ],
                    [ 30.0, 0.0 ]
                ]
            }
        ],
        hasProjections: true,
        projections: [
            {
                text: "Salut",
                startTime: 12.0,
                duration: 4.0,
                fadeIn: 0.5,
                fadeOut: 0.5,
            },
            {
                text: "Ca va ?",
                startTime: 16.2,
                duration: 4.0,
                fadeIn: 0.5,
                fadeOut: 0.5,
            },
            {
                text: "Tu passes une bonne journée ?",
                startTime: 20.4,
                duration: 6.0,
                fadeIn: 0.5,
                fadeOut: 0.5,
            }
        ]
    },
    {
        name: "Scene-02",
        duration: 121.2,
        info: "Test scene with only lights",
        hasLights: true,
        lights: [
            {
                scene: "testDmxScene 2",
                amplitude: 1.0,
                level: [
                    [0.0, 0.0],
                    [2.1, 1.0],
                    [119.1, 1.0],
                    [121.2, 0.0]
                ],
                elements: [
                    {
                        address: 13,
                        values: [255]
                    },
                    {
                        address: 14,
                        values: [255]
                    },
                    {
                        address: 15,
                        values: [255]
                    },
                    {
                        address: 16,
                        values: [255]
                    },
                ]
            },
        ],
        hasAudio: false,
        hasProjections: false,
    },
    {
        name: "Scene-03",
        duration: 605,
        info: "Long test scene with lights and audio",
        hasLights: true,
        lights: [
            {
                scene: "testDmxScene 2",
                amplitude: 1.0,
                level: [
                    [0.0, 0.0],
                    [2.1, 1.0],
                    [602.9, 1.0],
                    [605, 0.0]
                ],
                elements: [
                    {
                        address: 13,
                        values: [255]
                    },
                    {
                        address: 14,
                        values: [255]
                    },
                    {
                        address: 15,
                        values: [255]
                    },
                    {
                        address: 16,
                        values: [255]
                    },
                    {
                        address: 17,
                        values: [255]
                    },
                    {
                        address: 18,
                        values: [255]
                    },
                    {
                        address: 19,
                        values: [255]
                    },
                    {
                        address: 20,
                        values: [255]
                    }
                ]
            },
        ],
        hasAudio: true,
        audio: [
            {
                track: "acid-meltdown",
                startTime: 100.0,
                duration: 20.0,
                amplitude: 1.0,
                volume: [
                    [ 0.0, 0.0 ],
                    [ 2.0, 1.0 ],
                    [ 18.0, 1.0 ],
                    [ 20.0, 0.0 ],
                ]
            },
            {
                track: "acid-meltdown",
                startTime: 200.0,
                duration: 20.0,
                amplitude: 1.0,
                volume: [
                    [ 0.0, 0.0 ],
                    [ 2.0, 1.0 ],
                    [ 18.0, 1.0 ],
                    [ 20.0, 0.0 ],
                ]
            },
            {
                track: "acid-meltdown",
                startTime: 300.0,
                duration: 20.0,
                amplitude: 1.0,
                volume: [
                    [ 0.0, 0.0 ],
                    [ 2.0, 1.0 ],
                    [ 18.0, 1.0 ],
                    [ 20.0, 0.0 ],
                ]
            },
        ],
        hasProjections: false,
    }
];

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
                value
            } = template;

            return {
                name,
                isPriority: calculateParamVal(isPriority, args),
                enabled: calculateParamVal(enabled, args),
                weight: calculateParamVal(weight, args),
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
    return getImprovibarSceneTemplates(libraries);
}


//@TODO: Add an override function to customize values in scene
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

function getRandomElementFromAudioLib(libraries: LoadedLibrary<AleasAudioLibrary>, libName: string): string {
    const lib = libraries[libName];
    const index = randomInt(0, lib.count);

    return `${libName}-${(index + 1).toString().padStart(2, "0")}`;
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
    return getImprovibarStaticElements(libraries);
}

function getPreshowElements(args: GenerateAleasPreShowArgs, libraries: LoadedLibraries): AleasPreshowElements {
    return getImprovibarPreshowElements(args, libraries);
}

function getPostshowElements(args: GenerateAleasPostShowArgs, libraries: LoadedLibraries): AleasPostShowElements {
    return getImprovibarPostshowElements(args, libraries);
}


function getImprovibarSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {

    const factories: ((libraries: LoadedLibraries) => AleasSceneTemplate)[] = [
        improvibar.templates["Mid scene - lights only"],
        improvibar.templates["Mid scene - with music"],
        improvibar.templates["Mid scene - with projection at start"]
    ];

    const templates = factories.map(factory => factory(libraries));
    return templates;
};

const improvibarScenes = [
    "Pleins feux chaud",
    "Pleins feux froid",
    "Barre + bleu",
    "Glauque"
]

type ImprovibarScene = typeof improvibarScenes[number];
const improvibar = {

    templates: {

        "Mid scene - lights only": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const durationRange = [30, 360];

            const scenes: ImprovibarScene[] = [
                "Pleins feux chaud",
                "Pleins feux froid",
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = randomRange(durationRange[0], durationRange[1]);
        
                return {
                    templateName: "Mid scene - lights only",
                    duration,
                    info: "Mid scene with lights only"
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number): LightsElementsOrNoLights => {
        
                const fadeIn = randomRange(0, 5);
                const fadeOut = randomRange(0, 5);

                const scene = randomElement(scenes);
        
                const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);
                return {
                    hasLights: true,
                    lights: [
                        {
                            scene: "Pleins feux chaud",
                            amplitude: 1.0,
                            level: [
                                [0.0, 0.0],
                                [fadeIn, 1.0],
                                [duration - fadeOut, 1.0],
                                [duration, 0.0]
                            ],
                            elements: valueSegments
                        }
                    ]
                }
            }

            return {
                name: "Mid scene - lights only",
                isPriority: false,
                enabled: true,
                weight: 10,
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                }, libraries)
            }
        },

        "Mid scene - with music": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const durationRange = [45, 360];

            const scenes: ImprovibarScene[] = [
                "Pleins feux chaud",
                "Pleins feux froid",
                "Barre + bleu",
                "Glauque"
            ]

            const audioLib = "aleas-general";
            const audioDurationRange = [30, 100];
            const audioVolumeRange = [0.5, 0.7];

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = randomRange(durationRange[0], durationRange[1]);
        
                return {
                    templateName: "Mid scene - with music",
                    duration,
                    info: "Mid scene - with music"
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
        
                const fadeIn = randomRange(0, 5);
                const fadeOut = randomRange(0, 5);

                const scene = randomElement(scenes);
        
                const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);
                return {
                    hasLights: true,
                    lights: [
                        {
                            scene,
                            amplitude: 1.0,
                            level: [
                                [0.0, 0.0],
                                [fadeIn, 1.0],
                                [duration - fadeOut, 1.0],
                                [duration, 0.0]
                            ],
                            elements: valueSegments
                        }
                    ]
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const margin = 5;
                const maxAudioDuration = Math.min(
                    duration - 2 * margin,
                    audioDurationRange[1]
                );

                const audioDuration = randomRange(
                    audioDurationRange[0],
                    maxAudioDuration
                );
                const fadeIn = randomRange(0, 5);
                const fadeOut = randomRange(0, 5);
                const amplitude = randomRange(audioVolumeRange[0], audioVolumeRange[1]);

                const audioStartTime = randomRange(0, duration - audioDuration - margin);
                const track = getRandomElementFromAudioLib(libraries.audioLibraries, audioLib);
                    
                return {
                    hasAudio: true,
                    audio: [
                        {
                            track: track,
                            startTime: audioStartTime,
                            duration: audioDuration,
                            amplitude,
                            volume: [
                                [0.0, 0.0],
                                [fadeIn, 1.0],
                                [duration - fadeOut, 1.0],
                                [duration, 0.0]
                            ]
                        }
                    ]
                }
            }

            return {
                name: "Mid scene - With audio",
                isPriority: false,
                enabled: true,
                weight: 20,
                requiredFeatures: [
                    
                ],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getAudio
                }, libraries)
            }
        },

        "Mid scene - with projection at start": function(libraries: LoadedLibraries): AleasSceneTemplate {
                
            const durationRange = [45, 360];

            const scenes: ImprovibarScene[] = [
                "Pleins feux chaud",
                "Pleins feux froid",
                "Barre + bleu",
                "Glauque"
            ]

            const shortProjectionDuration = 2.5;
            const projectionFade = 0.25;

            const texts = [
                "Salut",
                "Ca va ?",
                "Ceci est un test",
            ]

            const projectionDuration = texts.length * shortProjectionDuration;

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = randomRange(durationRange[0], durationRange[1]);
        
                return {
                    templateName: "Mid scene - with projection",
                    duration,
                    info: "Mid scene - with projection"
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
        
                const fadeIn = randomRange(0, 5);
                const fadeOut = randomRange(0, 5);

                const scene = randomElement(scenes);
        
                const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);
                return {
                    hasLights: true,
                    lights: [
                        {
                            scene,
                            amplitude: 1.0,
                            level: [
                                [projectionDuration, 0.0],
                                [projectionDuration + fadeIn, 1.0],
                                [duration - fadeOut, 1.0],
                                [duration, 0.0]
                            ],
                            elements: valueSegments
                        }
                    ]
                }
            }
            
            const getProjection = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ProjectionsElementsOrNoProjections => {
                return {
                    hasProjections: true,
                    projections: texts.map((text, i) => ({
                        text,
                        startTime: i * shortProjectionDuration,
                        duration: shortProjectionDuration,
                        fadeIn: projectionFade,
                        fadeOut: projectionFade
                    }))
                }
            }

            return {
                name: "Mid scene - With projection",
                isPriority: false,
                enabled: true,
                weight: 10,
                requiredFeatures: [
                    "projections"
                ],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getProjection
                }, libraries)
            
            }
        }
    }
}

function getImprovibarStaticElements(libraries: LoadedLibraries): AleasShowStaticElements {

    return {
        lights: {
            scene: "static",
            elements: getValuesFromScene(libraries.dmxScenes, "static")
        }
    }
}

function getImprovibarPreshowElements(args: GenerateAleasPreShowArgs, libraries: LoadedLibraries): AleasPreshowElements {
    
    return {

    }
}

function getImprovibarPostshowElements(args: GenerateAleasPostShowArgs, libraries: LoadedLibraries): AleasPostShowElements {
    return {
        
    }
}
