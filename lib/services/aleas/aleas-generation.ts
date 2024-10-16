import { RgbColor } from "../core/types/rgbColor";
import { HasId, Named, ShortNamed } from "../core/types/utils";
import { notImplemented, randomRange } from "../core/utils";
import { getAudioLibraryCollection, getInputProjectionLibraryCollection } from "./aleas-api";
import { getValue } from "./aleas-generation-utils";
import { generateTheatreDuTempsIntroScene, generateTheatreDuTempsOutroScene, generateTheatreDuTempsPresentationScene, getTheatreDuTempsSceneTemplates } from "./templates/theatre-du-temps";

export type RangeOrValue = number | Range;
export type Range = [ number, number ];

export type Fade = RangeOrValue | { fadeIn: RangeOrValue, fadeOut: RangeOrValue };

export type KeyFrame = [ number, number];

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

export type DepresentationInfo = {
    hasDepresentation: false;
} | {
    hasDepresentation: true;
    scene: string;
    duration: number;
    amplitude: number;
    fade: number;
    musicDuration: number;
    musicFade: number;
    musicVolume: number;
}

export type GenerateAleasIntroOutroArgs = {
    duration: RangeOrValue;
    fade: Fade;
    volume: number;
    blackout: {
        preScene: RangeOrValue;
        postScene: RangeOrValue;
    }
}

export type GenerateAleasNoPresentationArgs = {
    hasPresentation: false;
}

export type GenerateAleasHasPresentationArgs = {
    hasPresentation: true;
    fade: number;
    duration: number;
    volume: number;
    prePresentationBlackout: number;
    postPresentationBlackout: number;
}

export type GenerateAleasPresentationArgs = GenerateAleasNoPresentationArgs
    | GenerateAleasHasPresentationArgs

export type GenerateAleasIntroArgs = GenerateAleasIntroOutroArgs;
export type GenerateAleasOutroArgs = GenerateAleasIntroOutroArgs & {
    depresentation: DepresentationInfo;
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
    presentation: GenerateAleasPresentationArgs,
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
    presentation: {
        hasPresentation: false;
    } | {
        hasPresentation: true;
        fade: number;
        duration: number;
        volume: number;
        prePresentationBlackout: number;
        postPresentationBlackout: number;
    },
    intro: {
        duration: number;
        fadeIn: number;
        fadeOut: number;
    } & BlackoutInfo,
    outro: {
        duration: number;
        fadeIn: number;
        fadeOut: number;
        depresentation: {
            hasDepresentation: false;
        } | {
            hasDepresentation: true;
            scene: string;
            duration: number;
            amplitude: number;
            fade: number;
            musicDuration: number;
            musicFade: number;
            musicVolume: number;
        };
    } & BlackoutInfo,
}

function computeShowArgsValues(args: GenerateAleasShowArgs): GenerateAleasShowArgsValues {
    const blackoutFade = getFadeValues(args.blackout.fade);
    const introFade = getFadeValues(args.intro.fade);
    const outroFade = getFadeValues(args.outro.fade);

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
            fadeIn: introFade.fadeIn,
            fadeOut: introFade.fadeOut,
            blackout: {
                preScene: getValue(args.intro.blackout.preScene),
                postScene: getValue(args.intro.blackout.postScene)
            }
        },
        presentation: args.presentation.hasPresentation ? {
            hasPresentation: true,
            fade: args.presentation.fade,
            duration: args.presentation.duration,
            volume: args.presentation.volume,
            prePresentationBlackout: args.presentation.prePresentationBlackout,
            postPresentationBlackout: args.presentation.postPresentationBlackout,
        } : { hasPresentation: false },
        outro: {
            duration: getValue(args.outro.duration),
            fadeIn: outroFade.fadeIn,
            fadeOut: outroFade.fadeOut,
            depresentation: structuredClone(args.outro.depresentation),
            blackout: {
                preScene: getValue(args.intro.blackout.preScene),
                postScene: getValue(args.intro.blackout.postScene)
            }
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
}

export type AleasContentLibraryParamBase = {
    name: string;
    description?: string;
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
    value: KeyFrame[];
}


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
}


const hardCodedTheatreDuTempsLibrary: AleasContentScene[] = [
    {
        name: "preshow",
        projectIndex: 3,
        description: "Preshow",
        tags: [ "preshow"],
        fades: [
            {
                elements: [ "Title" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Projections" ],
                relativeOffset: 0.2,
            },
            {
                elements: [ "Pulses" ],
                relativeOffset: 0.6
            },
            {
                elements: [ "Alcove" ],
                relativeOffset: 1.0
            },
            {
                elements: [ "Services" ],
                relativeOffset: 1.6
            }
        ]
    },
    {
        name: "postshow",
        projectIndex: 4,
        description: "Postshow",
        tags: [ "postshow"],
        fades: [
            {
                elements: [ "Title" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Projections" ],
                relativeOffset: 0.2,
            },
            {
                elements: [ "Pulses" ],
                relativeOffset: 0.6
            },
            {
                elements: [ "Alcove" ],
                relativeOffset: 1.0
            },
            {
                elements: [ "Services" ],
                relativeOffset: 1.6
            }
        ]
    },
    {
        name: "confessionnal",
        projectIndex: 5,
        description: "Confessionnal",
        tags: [ "confessionnal"],
        fades: [
            {
                elements: [
                    "Timer projection",
                ],
                relativeOffset: 0.,
            },
            {
                elements: [
                    "Alcove",
                ],
                relativeOffset: 0.8
            }
        ]
    },
    {
        name: "intro",
        projectIndex: 6,
        description: "Intro",
        tags: [ "intro" ],
        steps: [
            {
                name: "intro-01",
                elements: [ "Douche Jar" ]
            },
            {
                name: "Intro-02",
                elements: [ "Douche Cour" ]
            },
            {
                name: "Intro-03",
                elements: [ "Découpe centrale" ]
            },
            {
                name: "Intro-04",
                elements: [ "Alcove" ]
            }
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ]
    },
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
                elements: [ "lats" ],
                relativeOffset: 0.3,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.7
            }
        ]
    },
    {
        name: "pf-froid",
        projectIndex: 8,
        description: "Pleins feux - Froid",
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
                elements: [ "lats" ],
                relativeOffset: 0.3,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.7
            }
        ]
    },
    {
        name: "full-color",
        projectIndex: 9,
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
                relativeOffset: 0.6,
            }
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            }
        ]
    },
    {
        name: "bicolor",
        projectIndex: 10,
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
                relativeOffset: 0.6,
            }
        ],
        params: [
            {
                name: "color-contres",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
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
    {
        name: "tricolor",
        projectIndex: 11,
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
                relativeOffset: 0.6,
            }
        ],
        params: [
            {
                name: "color-contres",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
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
    {
        name: "douche-jar",
        projectIndex: 12,
        description: "Douche - Jardin",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Face" ],
                relativeOffset: 0.6,
            }
        ]
    },
    {
        name: "douche-cour",
        projectIndex: 13,
        description: "Douche - Cour",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Face" ],
                relativeOffset: 0.6,
            }
        ]
    },
    {
        name: "double-douches",
        projectIndex: 14,
        description: "Double douches",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Face" ],
                relativeOffset: 0.6,
            }
        ]
    },
    {
        name: "decoupe-centrale",
        projectIndex: 15,
        description: "Découpe centrale",
        tags: [
            "decoupe",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Découpe" ],
                relativeOffset: 0.,
            },
        ]
    },
    {
        name: "white-rotation",
        projectIndex: 16,
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
    {
        name: "douches-alternate",
        projectIndex: 17,
        description: "Douches alternées",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Face" ],
                relativeOffset: 0.6,
            }
        ],
        steps: [
            {
                name: "douche-01",
                elements: [ "Douche Jar" ]
            },
            {
                name: "douche-02",
                elements: [ "Douche Cour" ]
            }
        ]
    },
    {
        name: "pf-ch-basc-col",
        projectIndex: 18,
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
                relativeOffset: 0.5,
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
    {
        name: "pf-fr-basc-col",
        projectIndex: 19,
        description: "PF Froid - Bascule Couleur",
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
                relativeOffset: 0.5,
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
                elements: [ "Colors" ]
            }
        ]
    },
    {
        name: "col-swap-2",
        projectIndex: 20,
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
                relativeOffset: 0.6,
            }
        ],
        params: [
            {
                name: "color-1",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
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
    {
        name: "col-swap-3",
        projectIndex: 21,
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
                relativeOffset: 0.6,
            }
        ],
        params: [
            {
                name: "color-1",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
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
    {
        name: "col-basc-decoupe",
        projectIndex: 22,
        description: "Color Bascule Decoupe",
        tags: [
            "color",
            "bascule",
            "bascule-col"
        ],
        fades: [
            {
                elements: [
                    "Colors",
                    "Découpe"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.6,
            }
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
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
    {
        name: "color-wave",
        projectIndex: 24,
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
                relativeOffset: 0.6,
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
    {
        name: "pf-ch-basc-str",
        projectIndex: 25,
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
                relativeOffset: 0.5,
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
        ]
    },
    {
        name: "proj-input",
        projectIndex: 26,
        tags: [
            "projection",
        ],
        description: "Projection - Input",
        fades: [
            {
                elements: [
                    "contres",
                    "lats",
                    "lats-led"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.4,
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
                    "Lats-Led"
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
    {
        name: "rectangle-doors",
        projectIndex: 28,
        description: "Rectangle Doors",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Doors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.6,
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
                saturationRange: [ 0.0, 0.22 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "color2",
                type: "color",
                link: {
                    to: "color1",
                    hueRotation: [0, 1/2]
                }
            },
            {
                name: "x1",
                type: "float",
                range: [0.1, 0.4]
            },
            {
                name: "y1",
                type: "float",
                value: 0.0
            },
            {
                name: "w1",
                type: "float",
            },
            {
                name: "h1",
                type: "float",
            },
            {
                name: "x2",
                type: "float",
                range: [0.6, 0.9]
            },
            {
                name: "y2",
                type: "float",
                value: 0.0
            },
            {
                name: "w2",
                type: "float",
            },
            {
                name: "h2",
                type: "float",
            },
        ]
    },
    {
        name: "line-swipe",
        projectIndex: 29,
        description: "Line Swipe",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Background" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Line" ],
                relativeOffset: 0.6,
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
    {
        name: "face-line",
        projectIndex: 30,
        description: "Face Line",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Line" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.6,
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
    {
        name: "double-face-line",
        projectIndex: 31,
        description: "Double Face Line",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Lines" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.6,
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
                saturationRange: [ 0.0, 0.22 ],
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
    {
        name: "circle-pulse",
        description: "Circle Pulse",
        projectIndex: 32,
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Circle" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.6,
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
                name: "circle-color",
                type: "color",
                saturationRange: [ 0.0, 0.22 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "min-radius",
                type: "float",
            },
            {
                name: "pulse-range",
                type: "float",
            },
            {
                name: "pulse-speed",
                type: "float",
            },
            {
                name: "height",
                type: "float",
            },
            {
                name: "feathering",
                type: "float",
            }
        ]
    }
]

async function loadLibraries(): Promise<LoadedLibraries> {

    const contentLibrary = hardCodedTheatreDuTempsLibrary;
    const audioLibrary = await getAudioLibraryCollection("aleas-2024");
    const inputLibrary = await getInputProjectionLibraryCollection("aleas-2024");

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

    const libraries: LoadedLibraries = {
        contentLibraries,
        audioLibraries,
        inputProjectionLibraries
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
        presentation,
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

    if (presentation.hasPresentation) {

        const presentationScene = generatePresentationScene(presentation, libraries);
        scenes.push({
            ...presentationScene,
            name: "Presentation",
            displayName: "Presentation"
        });

        currentTime += getWholeDuration(presentationScene);
    }

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

function generatePresentationScene(args: GenerateAleasHasPresentationArgs, libraries: LoadedLibraries): SceneData {
    return generateTheatreDuTempsPresentationScene(args, libraries);
}

function generateIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    return generateTheatreDuTempsIntroScene(args, libraries);
}

function generateOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    return generateTheatreDuTempsOutroScene(args, libraries);
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
    return getTheatreDuTempsSceneTemplates(libraries);
}