import { type } from "os";
import { RgbColor } from "../core/types/rgbColor";
import { HasId, Named, ShortNamed } from "../core/types/utils";
import { notImplemented, randomRange } from "../core/utils";
import { getAudioLibraryCollection, getInputProjectionLibraryCollection, getMonologueLibrary } from "./aleas-api";
import { getValue } from "./aleas-generation-utils";
import { generateRepetitionIntroScene, generateRepetitionOutroScene, getRepetitionSceneTemplates } from "./templates/repetition-aleas";

export type RangeOrValue = number | Range;
export type Range = [ number, number ];

export type Fade = RangeOrValue | { fadeIn: RangeOrValue, fadeOut: RangeOrValue };

type GenericKeyFrame<T> = [ number, T ];
export type KeyFrame = GenericKeyFrame<number>;
export type ColorKeyFrame = GenericKeyFrame<RgbColor>;
export type StringKeyFrame = GenericKeyFrame<string>;

export type StartAndDuration = {
    startTime: number;
    duration: number;
}

export const aleasFeatures = [
    "projections",
    "monologues",
    "confessionnal",
    "stroboscopes",
    "smokeMachine",
    "timedScenes",
] as const;

export type AleasFeatures = typeof aleasFeatures[number];

export type AleasFeaturesMap = {
    [key in AleasFeatures]: boolean;
};

export type GenerateAleasIntroOutroArgs = {
    duration: RangeOrValue;
    volume: number;
}

export type GenerateAleasIntroArgs = GenerateAleasIntroOutroArgs;
export type GenerateAleasOutroArgs = GenerateAleasIntroOutroArgs & {
    depresentationVolume: number;
};

export type GenerateAleasShowArgs = {
    generation: {
        save: boolean;
    },
    show: {
        totalDuration: RangeOrValue;
        showName: string;
        lightingPlan: string;
        startOffset: number;
    },
    blackout: {
        duration: RangeOrValue;
        minDuration: RangeOrValue;
        maxDuration: RangeOrValue;
        fade?: Fade;
    },
    intro: GenerateAleasIntroArgs,
    outro: GenerateAleasOutroArgs,
    features: Partial<AleasFeaturesMap>,
}

export type GenerateAleasShowArgsValues = {
    show: {
        totalDuration: number;
        startOffset: number;
    },
    blackout: {
        duration: number;
        minDuration: number;
        maxDuration: number;
        fadeIn: number;
        fadeOut: number;
    }
    intro: {
        duration: number;
    },
    outro: {
        duration: number;
        depresentationVolume: number;
    },
}

function computeShowArgsValues(args: GenerateAleasShowArgs): GenerateAleasShowArgsValues {
    const blackoutFade = getFadeValues(args.blackout.fade);

    return {
        show: {
            totalDuration: getValue(args.show.totalDuration),
            startOffset: args.show.startOffset
        },
        blackout: {
            duration: getValue(args.blackout.duration),
            minDuration: getValue(args.blackout.minDuration),
            maxDuration: getValue(args.blackout.maxDuration),
            fadeIn: blackoutFade.fadeIn,
            fadeOut: blackoutFade.fadeOut
        },
        intro: {
            duration: getValue(args.intro.duration),
        },
        outro: {
            duration: getValue(args.outro.duration),
            depresentationVolume: args.outro.depresentationVolume,
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


export type AleasMonologue = {
    text: string;
}

export type AleasMonologueLibrary = {
    model: string;
    monologues: AleasMonologue[];
} & Named & ShortNamed & HasId;


export type AleasInputProjectionLibrariesCollection = {
    libraries: AleasInputProjectionLibrary[];
} & Named & ShortNamed & HasId;

export type AleasInputProjectionLibrary = {
    name: string;
    key: string;
    elements: string[];
}

export type AleasContentLibraryFade = {
    elements?: string[];
    relativeOffset: number;
    instant?: boolean;
}

export type AleasContentLibraryParamBase = {
    name: string;
    description?: string;
    mapAsglobal?: boolean;
}

export type AleasContentLibraryFloatParam = AleasContentLibraryParamBase & {
    type: "float";
    link?: {
        to: string;
        offset?: number|Range;
    }
    range?: Range;
    value?: number;
}

export type AleasContentLibraryIntParam = AleasContentLibraryParamBase & {
    type: "int";
    link?: {
        to: string;
        offset?: number|Range;
    }
    range?: Range;
    value?: number;
}

export type AleasContentLibraryStringParam = AleasContentLibraryParamBase & {
    type: "string";
    value?: undefined;
    link?: {
        to: string;
    }
}

export type AleasContentLibraryBoolParam = AleasContentLibraryParamBase & {
    type: "bool";
    value?: boolean;
    link?: {
        to: string;
    }
}

export type AleasContentLibraryColorParam = AleasContentLibraryParamBase & {
    type: "color";
    value?: RgbColor;
    link?: {
        to: string;
        hueRotation?: number|number[];
        saturationOffset?: number|Range;
        valueOffset?: number|Range;
    }
    valueRange?: Range;
    saturationRange?: Range;
}

export type AleasContentLibraryParam = AleasContentLibraryFloatParam
    | AleasContentLibraryIntParam
    | AleasContentLibraryStringParam
    | AleasContentLibraryBoolParam
    | AleasContentLibraryColorParam;
    

export type AleasContentLibraryStep = {
    name: string;
    description?: string;
    elements?: string[];
}

export type AleasContentLibraryValue = {
    name: string;
    description?: string;
    mapAsGlobal?: boolean;
    type: "float"|"color"|"string";
}

export type AleasContentScene = {
    name: string;
    projectIndex: number;
    description?: string;
    tags?: string[];
    fades?: AleasContentLibraryFade[];
    params?: AleasContentLibraryParam[];
    steps?: AleasContentLibraryStep[];
    values?: AleasContentLibraryValue[];
}


export type SceneBaseInfo = {
    templateName: string;
    duration: number;
    isLoop?: boolean;
    info: string;
}

export type BlackoutInfo = {
    blackout: {
        preScene: number;
        postScene: number;
    }
}


export type AudioElement = {
    track: string;
    startTime: number;
    duration: number;
    amplitude: number;
    volume: KeyFrame[];
    continueAfterSceneEnd?: boolean;
}
export type AudioElementsOrNoAudio = ({
    hasAudio: true,
    audio: AudioElement[]
} | { hasAudio: false })



export type ContentFadeElement = {
    elements?: string[];
    value: KeyFrame[];
}

export type ContentParamElement = {
    name: string;
    description?:string;
    mapAsGlobal?: boolean;
} & ({
    type: "float";
    value: number;
} | {
    type: "int";
    value: number;
} | {
    type: "string";
    value: string;
} | {
    type: "bool";
    value: boolean;
} | {
    type: "color";
    value: RgbColor;
})


export type ContentStepElement = {
    name: string;
    description?: string;
    elements?: string[];
    value: KeyFrame[];
}

export type ContentValueElement = {
    name: string;
    description?: string;
    mapAsGlobal?: boolean;
} & ({
    type: "float";
    value: KeyFrame[];
}|{
    type: "color";
    value: ColorKeyFrame[];
}|{
    type: "string";
    value: StringKeyFrame[];
})


export type ContentElement = {
    scene: {
        name: string;
        projectIndex: number;
    },
    fades: ContentFadeElement[],
    params?: ContentParamElement[],
    steps?: ContentStepElement[],
    values?: ContentValueElement[]
}

export type ContentElementOrNoContent = ({
    hasContent: true;
    content: ContentElement
}) | { hasContent: false }



export type SceneData = SceneBaseInfo
    & BlackoutInfo
    & AudioElementsOrNoAudio
    & ContentElementOrNoContent;

export type AleasShowScene = {
    name: string,
    displayName: string
}
    & SceneData;


export type AleasShow = {
    generationInfo: GenerationInfo;
    scenes: AleasShowScene[];
};

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

export type CalculateParamProgressionArgs = {
    totalTime: number;
    currentScene: number;
    currentTime: number;
    remainingTime: number;
    progress: number;
}

export type CalculateParamHistoryArgs = {
    history: CalculateParamHistory;
    occurences: number;
}

export type CalculateParamValArgs = CalculateParamProgressionArgs
                                & CalculateParamHistoryArgs;

type ProviderOrValueInType = number|boolean|object;
type ParamProvider<T extends ProviderOrValueInType> = (args: CalculateParamValArgs) => T;
export type ParamProviderOrValue<T extends ProviderOrValueInType> = ParamProvider<T>|T;

function calculateParamVal<T extends ProviderOrValueInType>(providerOrValue: ParamProviderOrValue<T>, args: CalculateParamValArgs): T {
    return typeof providerOrValue === "function" ? providerOrValue(args) : providerOrValue;
}


export type AleasSceneTemplate = {
    name: string;
    isPriority?: ParamProviderOrValue<boolean>;
    enabled?: ParamProviderOrValue<boolean>;
    weight: ParamProviderOrValue<number>;
    requiredFeatures?: AleasFeatures[];
    durationRange: ParamProviderOrValue<Range>;

    value: ParamProviderOrValue<SceneData>;
};

export type AleasSceneInstatiatedTemplate = {
    name: string;
    isPriority: boolean;
    enabled: boolean;
    weight: number;
    durationRange: Range;

    value: ParamProviderOrValue<SceneData>;
}

export type LoadedLibrary<T> = {
    [key: string]: T;
}

export type LoadedLibraries = {
    audioLibraries: LoadedLibrary<AleasAudioLibrary>;
    contentLibraries: LoadedLibrary<AleasContentScene>;
    inputProjectionLibraries: LoadedLibrary<AleasInputProjectionLibrary>;
    monologueLibraries: LoadedLibrary<AleasMonologueLibrary>;
}


const hardCodedImprovidenceLibrary: AleasContentScene[] = [
    // Intro
    {
        name: "intro",
        projectIndex: 4,
        description: "Intro",
        tags: [ "intro" ],
        steps: [
            {
                name: "intro-01",
                elements: [ "Poursuite" ]
            },
            {
                name: "Intro-02",
                elements: [ "Lat Jar" ]
            },
            {
                name: "Intro-03",
                elements: [ "Douche centrale" ]
            },
            {
                name: "Intro-04",
                elements: [ "Lat Cour" ]
            }
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ]
    },
    // Outro
    {
        name: "outro",
        projectIndex: 5,
        description: "Outro",
        tags: [ "outro" ],
        steps: [
            {
                name: "intro-01",
                elements: [ "Poursuite" ]
            },
            {
                name: "Intro-02",
                elements: [ "Lat Jar" ]
            },
            {
                name: "Intro-03",
                elements: [ "Douche centrale" ]
            },
            {
                name: "Intro-04",
                elements: [ "Lat Cour" ]
            }
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ]
    },
    // Confessionnal
    {
        name: "confessionnal",
        projectIndex: 6,
        description: "Confessionnal",
        tags: [ "confessionnal"],
        fades: [
            {
                elements: [
                    "Timer projection",
                    "Shutter"
                ],
                relativeOffset: 0,
            },
            {
                elements: [
                    "Alcove",
                ],
                relativeOffset: 0.08,
            },
        ],
        params: [
            {
                name: "duration",
                type: "float"
            }
        ]
    },
    // PF - Chaud
    {
        name: "pf-chaud",
        projectIndex: 7,
        description: "Pleins feux - Chaud",
        tags: [
            "standard",
            "pleins-feux"
        ],
        fades: [
            {
                elements: [ "contres" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "diags" ],
                relativeOffset: 0.15,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.35
            }
        ]
    },
    // Full Color
    {
        name: "full-color",
        projectIndex: 8,
        description: "Full Color",
        tags: [
            "color",
            "ambient"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.35,
            }
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
            }
        ]
    },
    // Bicolor
    {
        name: "bicolor",
        projectIndex: 9,
        description: "Bicolor",
        tags: [
            "color",
            "ambient"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.35,
            }
        ],
        params: [
            {
                name: "color-contres",
                type: "color",
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
            },
            {
                name: "color-lats",
                type: "color",
                link: {
                    to: "color-contres",
                    hueRotation: [1/2, 1/3, 2/3],
                },
            }
        ]
    },
    // Tricolor
    {
        name: "tricolor",
        projectIndex: 10,
        description: "Tricolor",
        tags: [
            "color",
            "ambient"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.35,
            }
        ],
        params: [
            {
                name: "color-contres",
                type: "color",
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
            },
            {
                name: "color-jar",
                type: "color",
                link: {
                    to: "color-contres",
                    hueRotation: 1/3,
                }
            },
            {
                name: "color-cour",
                type: "color",
                link: {
                    to: "color-contres",
                    hueRotation: 2/3,
                }
            },
        ]
    },
    // Douche
    {
        name: "douche",
        projectIndex: 11,
        description: "Douche",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            }
        ]
    },
    // White rotation
    {
        name: "white-rotation",
        projectIndex: 12,
        description: "White rotation",
        tags: [
            "special",
            "loud",
            "intense"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }, 
        ],
        params: [
            {
                name: "reverse",
                type: "bool",
            },
            {
                name: "speed",
                type: "float",
            },
            {
                name: "width",
                type: "float",
            },
            {
                name: "min-color",
                type: "color",
                valueRange: [ 0.0, 0.23 ],
                saturationRange: [ 0.0, 0.0 ]
            },
            {
                name: "max-color",
                type: "color",
                valueRange: [ 0.85, 1.0 ],
                saturationRange: [ 0.0, 0.0 ]
            },
        ]
    },
    // PF Chaud - Bascule Couleur
    {
        name: "pf-ch-basc-col",
        projectIndex: 13,
        description: "PF Chaud - Bascule Couleur",
        tags: [
            "bascule",
            "bascule-pf"
        ],
        fades: [
            {
                elements: [
                    "colors",
                    "contres",
                    "lats"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.25,
            },
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            }
        ],
        steps: [
            {
                name: "pf",
                elements: [
                    "Faces",
                    "Contres",
                    "Lats"
                ]
            },
            {
                name: "color",
                elements: [ "Colors" ],
            }
        ]
    },
    // Color swap x2
    {
        name: "col-swap-2",
        projectIndex: 14,
        description: "Color swap x2",
        tags: [
            "color",
            "ambient-swap"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.22,
            }
        ],
        params: [
            {
                name: "color-1",
                type: "color",
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
            },
            {
                name: "color-2",
                type: "color",
                link:{
                    to: "color-1",
                    hueRotation: [1/2, 1/3, 2/3]
                }
            },
        ],
        steps: [
            {
                name: "color-01",
                elements: [ "Colors" ]
            },
            {
                name: "color-02",
                elements: [ "Colors" ]
            },
        ]
    },
    // Color swap x3
    {
        name: "col-swap-3",
        projectIndex: 15,
        description: "Color swap x3",
        tags: [
            "color",
            "ambient-swap"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "color-1",
                type: "color",
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
            },
            {
                name: "color-2",
                type: "color",
                link:{
                    to: "color-1",
                    hueRotation: 1/3,
                }
            },
            {
                name: "color-3",
                type: "color",
                link:{
                    to: "color-1",
                    hueRotation: 2/3,
                }
            },
        ],
        steps: [
            {
                "name": "color-01",
                "elements": [ "Colors" ]
            },
            {
                "name": "color-02",
                "elements": [ "Colors" ]
            },
            {
                "name": "color-03",
                "elements": [ "Colors" ]
            }
        ]
    },
    // Color Bascule Douche
    {
        name: "col-basc-douche",
        projectIndex: 16,
        description: "Color Bascule Douche",
        tags: [
            "color",
            "bascule",
            "bascule-col"
        ],
        fades: [
            {
                elements: [
                    "Colors",
                    "Douche"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
            },
        ],
        steps: [
            {
                name: "color",
                elements: [ "Colors" ]
            },
            {
                name: "decoupe",
                elements: [ "Découpe" ]
            }
        ]
    },
    // Color wave
    {
        name: "color-wave",
        projectIndex: 17,
        description: "Color Wave",
        tags: [
            "special",
            "ambient"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "front-color",
                type: "color",
                saturationRange: [ 0.9, 1.0 ],
                valueRange: [ 0.6, 0.8 ]
            },
            {
                name: "back-color",
                type: "color",
                link: {
                    to: "front-color",
                    hueRotation: [1/2, 1/3, 2/3],
                    saturationOffset: [-0.4, -0.15],
                    valueOffset: [-0.2, 0.2]
                }
            },
            {
                name: "effect-size",
                type: "float",
            },
            {
                name: "effect-speed",
                type: "float"
            }
        ]
    },
    // PF Chaud - Bascule Stroboscopes
    {
        name: "pf-ch-basc-str",
        projectIndex: 18,
        description: "PF Chaud - Bascule Stroboscopes",
        tags: [
            "bascule",
            "bascule-pf",
            "strobes",
            "loud"
        ],
        fades: [
            {
                elements: [
                    "colors",
                    "contres",
                    "lats"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "strobes-color",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            },
            {
                name: "strobes-speed",
                type: "float",
            },
        ],
        steps: [
            {
                name: "pf",
                elements: [ "Plein feux" ]
            },
            {
                name: "strobes",
                elements: [ "strobes" ]
            }
        ]
    },
    // Projection - Input
    {
        name: "proj-input",
        projectIndex: 19,
        tags: [
            "projection",
        ],
        description: "Projection - Input",
        fades: [
            {
                elements: [
                    "contres",
                    "diags",
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "input",
                type: "string",
            },
        ],
        steps: [
            {
                name: "proj-input",
                elements: [
                    "Projection",
                    "Shutter"
                ]
            },
            {
                name: "pf chaud",
                elements: [
                    "Faces",
                    "Lats",
                    "Contres"
                ]
            }
        ]
    },
    // Monologue
    {
        name: "monologue",
        projectIndex: 20,
        tags: [
            "monologue",
        ],
        description: "Monologue",
        fades: [
            {
                elements: [
                    "contres",
                    "diags",
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        steps: [
            {
                name: "projection",
                elements: [
                    "Projection",
                    "Shutter"
                ]
            },
            {
                name: "pf chaud",
                elements: [
                    "Faces",
                    "Lats",
                    "Contres"
                ]
            }
        ],
        values: [
            {
                name: "text",
                type: "string",
            }
        ]
    },
    // Line Swipe
    {
        name: "line-swipe",
        projectIndex: 21,
        description: "Line Swipe",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [
                    "Background",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Line" ],
                relativeOffset: 0.30,
            }
        ],
        params: [
            {
                name: "background-color",
                type: "color",
                saturationRange: [ 0.0, 0.1 ],
                valueRange: [ 0.0, 0.1 ]
            },
            {
                name: "line-color",
                type: "color",
                saturationRange: [ 0.0, 0.22 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "line-width",
                type: "float",
            },
            {
                name: "line-speed",
                type: "float",
            },
            {
                name: "line-period",
                type: "float",
            },
            {
                name: "left-to-right",
                type: "bool",
            },
            {
                name: "front-gradient",
                type: "float",
            },
            {
                name: "back-gradient",
                type: "float",
            }
        ]
    },
    // Face Line
    {
        name: "face-line",
        projectIndex: 22,
        description: "Face Line",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [
                    "Line",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.3,
            }
        ],
        params: [
            {
                name: "background-color",
                type: "color",
                saturationRange: [ 0.0, 0.1 ],
                valueRange: [ 0.0, 0.1 ]
            },
            {
                name: "line-color",
                type: "color",
                saturationRange: [ 0.0, 1.0 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "h",
                type: "float",
            },
            {
                name: "line-width",
                type: "float",
            },
            {
                name: "rotation",
                type: "float",
            },
            {
                name: "upper-gradient",
                type: "float",
            },
            {
                name: "lower-gradient",
                type: "float",
            }
        ]
    },
    // Double Face Line
    {
        name: "double-face-line",
        projectIndex: 23,
        description: "Double Face Line",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [
                    "Lines",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.3,
            }
        ],
        params: [
            {
                name: "background-color",
                type: "color",
                saturationRange: [ 0.0, 0.1 ],
                valueRange: [ 0.0, 0.1 ]
            },
            {
                name: "color1",
                type: "color",
                saturationRange: [ 0.0, 1.0 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "color2",
                type: "color",
                link: {
                    to: "color1",
                }
            },
            {
                name: "h1",
                type: "float",
            },
            {
                name: "h2",
                type: "float",
            },
            {
                name: "line-width",
                type: "float",
            },
            {
                name: "rotation1",
                type: "float",
            },
            {
                name: "rotation2",
                type: "float",
            },
            {
                name: "upper-gradient",
                type: "float",
            },
            {
                name: "lower-gradient",
                type: "float",
            }
        ]
    },
    // Clouds
    {
        name: "clouds",
        description: "Clouds",
        projectIndex: 24,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Foreground",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.45,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "scale",
                type: "float",
            },
            {
                name: "color",
                type: "color",
                valueRange: [ 0.95, 1.0 ]
            },
            {
                name: "fg-color",
                type: "color",
                link: {
                    to: "color",
                    hueRotation: [1/3, 1/2, 2/3, 0],
                    valueOffset: [-0.25, -0.1]
                }
            }
        ]
    },
    // Glowing Dots
    {
        name: "glowing-dots",
        description: "Glowing Dots",
        projectIndex: 25,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Foreground",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.45,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "scale",
                type: "float",
            },
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.5, 1.0],
                valueRange: [ 0.95, 1.0 ]
            },
            {
                name: "fg-color",
                type: "color",
                link: {
                    to: "color",
                    hueRotation: [1/3, 1/2, 2/3, 0],
                    valueOffset: [-0.25, -0.1]
                }
            }
        ]
    },
    // Moving Grid
    {
        name: "moving-grid",
        description: "Moving Grid",
        projectIndex: 26,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Master",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "scale",
                type: "float",
            },
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.5, 1.0],
                valueRange: [ 0.95, 1.0 ]
            },
        ]
    },
    // Dots Flow
    {
        name: "dots-flow",
        description: "Dots Flow",
        projectIndex: 27,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Foreground",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.45,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.5, 1.0],
                valueRange: [ 0.95, 1.0 ]
            },
            {
                name: "fg-color",
                type: "color",
                link: {
                    to: "color",
                    hueRotation: 0,
                    valueOffset: [-0.25, -0.1]
                }
            }
        ]
    },
    // Led Wall
    {
        name: "led-wall",
        description: "Led Wall",
        projectIndex: 28,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Foreground",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.45,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "scale",
                type: "float",
            },
            {
                name: "reverse",
                type: "bool",
            },
        ]
    },
    // Lats - Alternate
    {
        name: "lats-alternate",
        projectIndex: 29,
        description: "Lats - Alternate",
        tags: [
            "standard",
            "lats"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ],
        steps: [
            {
                name: "Jardin",
                elements: [ "lat-jar" ]
            },
            {
                name: "Cour",
                elements: [ "lat-cour" ]
            }
        ]
    },
    // Diags - Alternate
    {
        name: "diags-alternate",
        projectIndex: 30,
        description: "Diags - Alternate",
        tags: [
            "standard",
            "diags"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ],
        steps: [
            {
                name: "Jardin",
                elements: [ "diag-jar" ]
            },
            {
                name: "Cour",
                elements: [ "diag-cour" ]
            }
        ]
    },
    // Autos Tracking
    {
        name: "autos-tracking",
        projectIndex: 31,
        tags: [
            "autos"
        ],
        description: "Autos Tracking",
        fades: [
            {
                relativeOffset: 0.,
                elements: [ "colors" ]
            },
            {
                relativeOffset: 0.25,
                elements: [ "faces" ]
            }
        ],
        params: [
            {
                name: "color",
                type: "color",
                valueRange: [ 0.7, 1.0 ],
                saturationRange: [ 1.0, 1.0 ]
            },
        ],
        values: [
            "jar1Pan",
            "jar1Tilt",
            "jar2Pan",
            "jar2Tilt",
            "cour1Pan",
            "cour1Tilt",
            "cour2Pan",
            "cour2Tilt",
        ].map(name => ({
            name,
            type: "float",
            mapAsGlobal: true
        }))
    },
    // Lat Jar
    {
        name: "lat-jar",
        projectIndex: 32,
        tags: [
            "Isolation"
        ],
        description: "Lat Jar",
        fades: [
            {
                relativeOffset: 0.,
                elements: [ "master" ]
            }
        ],
    },
    // Diag Cour
    {
        name: "diag-cour",
        projectIndex: 33,
        tags: [
            "Isolation"
        ],
        description: "Diag Cour",
        fades: [
            {
                relativeOffset: 0.,
                elements: [ "master" ]
            }
        ],
    },
    
]

async function loadLibraries(): Promise<LoadedLibraries> {

    const contentLibrary = hardCodedImprovidenceLibrary;
    const audioLibrary = await getAudioLibraryCollection("aleas-2024");
    const inputLibrary = await getInputProjectionLibraryCollection("aleas-2024");
    const monologueLibrary = await getMonologueLibrary("batch-01");

    const contentLibraries = contentLibrary.reduce((acc, library) => {
        acc[library.name] = library;
        return acc;
    }, {} as LoadedLibrary<AleasContentScene>);

    const audioLibraries = audioLibrary.libraries.reduce((acc, library) => {
        acc[library.key] = library;
        return acc;
    }, {} as LoadedLibrary<AleasAudioLibrary>);

    const inputProjectionLibraries = inputLibrary.libraries.reduce((acc, library) => {
        acc[library.key] = library;
        return acc;
    }, {} as LoadedLibrary<AleasInputProjectionLibrary>);

    const monologueLibraries = {
        ["default"]: monologueLibrary
    } as LoadedLibrary<AleasMonologueLibrary>;

    const libraries: LoadedLibraries = {
        contentLibraries,
        audioLibraries,
        inputProjectionLibraries,
        monologueLibraries
    }

    return libraries;
}

const getWholeDuration = (scene: SceneData): number => scene.blackout.preScene + scene.duration + scene.blackout.postScene;

export async function generateAleasShow(args: GenerateAleasShowArgs): Promise<AleasShow> {

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
        },
    } = argsValues;

    
    const libraries = await loadLibraries();
    const templates = await getAleasSceneTemplates(libraries);

    let currentTime = 0;
    let currentScene = 0;
    const history: CalculateParamHistory = {
        elements: [],
        counts: {}
    };
    
    const scenes: AleasShowScene[] = [];

    const intro = generateIntroScene(args, libraries);

    currentTime += getWholeDuration(intro);

    scenes.push({
        ...intro,
        name: "Intro",
        displayName: "Intro"
    });

    while (currentTime < totalDuration) {

        const progressionArgs: CalculateParamProgressionArgs = {
            currentTime,
            totalTime: totalDuration,
            remainingTime: totalDuration - currentTime,
            currentScene,
            progress: currentTime / totalDuration,
        };

        
        const next = getNextElementFromTemplates(templates, features, progressionArgs, history);

        const args: CalculateParamValArgs = {
            ...progressionArgs,
            history,
            occurences: history.counts[next.name] || 0
        }
        const nextScene = calculateParamVal(next.value, args);

        history.elements.push({
            name: next.name,
            duration: nextScene.duration
        });

        const newOccurencesCount = (history.counts[next.name] || 0) + 1;
        history.counts[next.name] = newOccurencesCount;

        scenes.push({
            name: `Scene-${(currentScene + 1).toString().padStart(2, "0")}`,
            displayName: `Scene-${(currentScene + 1).toString().padStart(2, "0")} - ${next.name} - ${newOccurencesCount.toString().padStart(2, "0")}`,
            ...nextScene
        });

        currentTime += getWholeDuration(nextScene);
        currentScene++;
    }

    const outro = generateOutroScene(args, libraries);

    scenes.push({
        ...outro,
        name: "Outro",
        displayName: "Outro"
    });

    return {
        generationInfo: {
            generatedAt: new Date(),
            values: argsValues,
            params: args
        },
        scenes
    }
}

export async function generateSceneFromTemplate(args: GenerateAleasShowArgs, templateName: string): Promise<SceneData> {

    const argsValues = computeShowArgsValues(args);

    
    const libraries = await loadLibraries();
    const templates = await getAleasSceneTemplates(libraries);

    const template = templates.find(t => t.name === templateName);

    if (!template) {
        throw new Error(`Template ${templateName} not found`);
    }

    const cpva: CalculateParamValArgs = {
        currentTime: 0,
        totalTime: argsValues.show.totalDuration,
        remainingTime: argsValues.show.totalDuration,
        currentScene: 0,
        progress: 0,
        history: {
            elements: [],
            counts: {}
        },
        occurences: 0
    }

    const instantiatedTemplate = instantiateTemplate(template, cpva);

    const result = calculateParamVal(instantiatedTemplate.value, cpva);

    return result;
}

function generateIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    return generateRepetitionIntroScene(args, libraries);
}

function generateOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    return generateRepetitionOutroScene(args, libraries);
}



export async function generateIntroSceneForTest(args: GenerateAleasShowArgs): Promise<SceneData> {

    const libraries = await loadLibraries();

    return generateIntroScene(args, libraries);
}

export async function generateOutroSceneForTest(args: GenerateAleasShowArgs): Promise<SceneData> {
    const libraries = await loadLibraries();

    return generateOutroScene(args, libraries);
}

function instantiateTemplate(template: AleasSceneTemplate, args: CalculateParamValArgs): AleasSceneInstatiatedTemplate {

    const {
        name,
        isPriority,
        enabled,
        weight,
        durationRange,
        value
    } = template;

    return {
        name,
        isPriority: isPriority !== undefined ? calculateParamVal(isPriority, args) : false,
        enabled: enabled !== undefined ? calculateParamVal(enabled, args) : true,
        weight: calculateParamVal(weight, args),
        durationRange: calculateParamVal(durationRange, args),
        value
    }
}

function getNextElementFromTemplates(templates: AleasSceneTemplate[], features: Partial<AleasFeaturesMap>, progArgs: CalculateParamProgressionArgs, history: CalculateParamHistory): AleasSceneInstatiatedTemplate {

    const instantiatedTemplates: AleasSceneInstatiatedTemplate[] = templates
        .filter(template => {
            const {
                requiredFeatures = []
            } = template;
            
            const hasRequiredFeatures = requiredFeatures.every(feature => features[feature] === true);
            return hasRequiredFeatures;
        })
        .map(template => {
            const occurences = history.counts[template.name] || 0;

            const args: CalculateParamValArgs = {
                ...progArgs,
                history,
                occurences
            }

            const result = instantiateTemplate(template, args);
            return result;
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

export type HardCodedTemplateParts<TArgs> = {
    getBaseInfo: (args: CalculateParamValArgs) => SceneBaseInfo;
    getBlackoutInfo?: (args: CalculateParamValArgs, minDuration: number, maxDuration: number) => BlackoutInfo;
    getAudio?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => AudioElementsOrNoAudio;
    getContent?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => ContentElementOrNoContent;
    getMoreArgs?: (args: CalculateParamValArgs, duration: number) => TArgs;
}

export function makeSceneProvider<TArgs = any>(parts: HardCodedTemplateParts<TArgs>, libraries: LoadedLibraries): ParamProvider<SceneData> {

    const {
        getBaseInfo,
        getBlackoutInfo = (args: CalculateParamValArgs, minDuration: number, maxDuration: number) => ({
            blackout: {
                preScene: 0,
                postScene: randomRange(minDuration, maxDuration)
            }
        }),
        getAudio = () => ({ hasAudio: false }),
        getContent = () => ({ hasContent: false}),
        getMoreArgs = () => { return {} as any;}
    } = parts;

    return (args: CalculateParamValArgs) => {
        const baseInfo = getBaseInfo(args);

        const { duration } = baseInfo;

        const moreArgs = getMoreArgs(args, duration);

        return {
            ...baseInfo,
            ...getBlackoutInfo(args, 1.8, 4.0),
            ...getContent(args, duration, libraries, moreArgs),
            ...getAudio(args, duration, libraries, moreArgs),
        }
    }
}

function getAleasSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {
    return getRepetitionSceneTemplates(libraries);
}