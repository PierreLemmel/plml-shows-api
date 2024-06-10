import { Timestamp } from "firebase/firestore";
import { type } from "os";
import { randomRange } from "../core/utils";
import { DmxValueSegment } from "../dmx/showControl";

export type RangeOrValue = number | [ number, number ];


export type Fade = number | { fadeIn: number, fadeOut: number };

export type KeyFrame = [ number, number ];

export const aleasFeatures = [
    "projections",
    "monologues",
    "confessionnal",
    "stroboscopes"
] as const;

export type AleasFeatures = typeof aleasFeatures[number];

export type AleasFeaturesMap = {
    [key in AleasFeatures]: boolean;
};

export type GenerateAleasShowArgs = {
    generation: {
        save: boolean;
    },
    show: {
        totalDuration: RangeOrValue;
        lightingPlan: string;
    },
    blackout: {
        duration: RangeOrValue;
        fade?: Fade;
    }
    preshow: {
        scene: string;
        fade: Fade;
    },
    postshow: {
        scene: string;
        fade: Fade;
    },
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

export type AleasShow = {
    generationInfo: GenerationInfo;
    preshow: {
        
    },
    postshow: {
        
    },
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
    else {
        const { fadeIn, fadeOut } = fade;
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

export function generateAleasShow(args: GenerateAleasShowArgs, templates: AleasSceneTemplate[]): AleasShow {

    const {
        features
    } = args;

    const argsValues = computeShowArgsValues(args);

    const {
        show: {
            totalDuration,
        },
        blackout: {
            duration: blackoutDurationValue
        }
    } = argsValues;


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

    

    return {
        generationInfo: {
            generatedAt: new Date(),
            values: argsValues,
            params: args
        },
        scenes,
        preshow: {},
        postshow: {},
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

export async function getAleasSceneTemplates(lightingPlan: string): Promise<AleasSceneTemplate[]> {
    return getImprovibarSceneTemplates();
}

type HardCodedTemplateParts = {
    getBaseInfo: (args: CalculateParamValArgs) => SceneBaseInfo;
    getLights: (args: CalculateParamValArgs, duration: number) => LightsElementsOrNoLights;
    getAudio?: (args: CalculateParamValArgs, duration: number) => AudioElementsOrNoAudio;
    getProjection?: (args: CalculateParamValArgs, duration: number) => ProjectionsElementsOrNoProjections;
}

function makeSceneProvider(parts: HardCodedTemplateParts): ParamProvider<SceneData> {

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
            ...getLights(args, duration),
            ...getAudio(args, duration),
            ...getProjection(args, duration)
        }
    }
}

function getImprovibarSceneTemplates(): AleasSceneTemplate[] {

    const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        const duration = randomRange(30, 600);

        return {
            templateName: "Test - No sound, no projections",
            duration,
            info: "Test scene with no sound and no projections"
        }
    }

    const getLights = (args: CalculateParamValArgs, duration: number): LightsElementsOrNoLights => {

        const fadeIn = randomRange(0, 5);
        const fadeOut = randomRange(0, 5);

        return {
            hasLights: true,
            lights: [
                {
                    scene: "Plein feux chaud",
                    amplitude: 1.0,
                    level: [
                        [0.0, 0.0],
                        [fadeIn, 1.0],
                        [duration - fadeOut, 1.0],
                        [duration, 0.0]
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
                }
            ]
        }
    }

    const getAudio = (args: CalculateParamValArgs, duration: number): AudioElementsOrNoAudio => {
        return {
            hasAudio: false
        }
    }

    const getProjection = (args: CalculateParamValArgs, duration: number): ProjectionsElementsOrNoProjections => {
        return {
            hasProjections: false
        }
    }

    return [
        {
            name: "test-01",
            isPriority: false,
            enabled: true,
            weight: 10,
            requiredFeatures: [],
            value: makeSceneProvider({
                getBaseInfo,
                getLights,
                getAudio,
                getProjection
            })
        }
    ]
};