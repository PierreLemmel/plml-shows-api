import { RgbColor } from "../core/types/rgbColor";
import { HasId, Named, ShortNamed } from "../core/types/utils";
import { randomRange } from "../core/utils";
import { getAudioLibraryCollection, getInputProjectionLibraryCollection, getMonologueLibrary } from "./aleas-api";
import { getValue } from "./aleas-generation-utils";
import { hardCodedTheatreDuTempsLibrary } from "./hard-coded-libraries/hardcoded-theatre-du-temps-lbrary";

import { generateTheatreDuTempsIntroScene, generateTheatreDuTempsOutroScene, getTheatreDuTempsSceneTemplates } from "./templates/theatre-du-temps";

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

export type GenerateAleasShowArgs = {
    generation: {
        save: boolean;
    },
    show: {
        totalDuration: RangeOrValue;
        showName: string;
        lightingPlan: string;
    },
}

export type GenerateAleasShowArgsValues = {
    show: {
        totalDuration: number;
    },
}

function computeShowArgsValues(args: GenerateAleasShowArgs): GenerateAleasShowArgsValues {
    return {
        show: {
            totalDuration: getValue(args.show.totalDuration),
        },
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
    info: string;
    blackout: number;
}

export type PreSceneElementOrNoPreScene = ({
    hasPreScene: false;
}|{
    hasPreScene: true;
    preScene: PreSceneElement;
})

export type PreSceneElement = ({
    duration: number;
    audio: {
        track: string;
        volume: number;
    };
    text: StringKeyFrame[],
    gapDuration: number;
})


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
    & PreSceneElementOrNoPreScene
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


async function loadLibraries(): Promise<LoadedLibraries> {

    const contentLibrary = hardCodedTheatreDuTempsLibrary;
    const audioLibrary = await getAudioLibraryCollection("aleas-2025");
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

    const monologueLibraries = {
        ["batch-01"]: await getMonologueLibrary("batch-01"),
        ["batch-02"]: await getMonologueLibrary("batch-02"),
    } as LoadedLibrary<AleasMonologueLibrary>;

    const libraries: LoadedLibraries = {
        contentLibraries,
        audioLibraries,
        inputProjectionLibraries,
        monologueLibraries
    }

    return libraries;
}

const getWholeDuration = (scene: SceneData): number => scene.blackout + (scene.hasPreScene ? scene.preScene.gapDuration : 0) + scene.duration;

export async function generateAleasShow(args: GenerateAleasShowArgs): Promise<AleasShow> {

    const argsValues = computeShowArgsValues(args);

    const {
        show: {
            totalDuration,
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

        
        const next = getNextElementFromTemplates(templates, progressionArgs, history);

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

function getNextElementFromTemplates(templates: AleasSceneTemplate[], progArgs: CalculateParamProgressionArgs, history: CalculateParamHistory): AleasSceneInstatiatedTemplate {

    const instantiatedTemplates: AleasSceneInstatiatedTemplate[] = templates
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
    getPreSceneInfo?: (args: CalculateParamValArgs) => PreSceneElementOrNoPreScene;
    getAudio?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => AudioElementsOrNoAudio;
    getContent?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => ContentElementOrNoContent;
    getMoreArgs?: (args: CalculateParamValArgs, duration: number) => TArgs;
}

export function makeSceneProvider<TArgs = any>(parts: HardCodedTemplateParts<TArgs>, libraries: LoadedLibraries): ParamProvider<SceneData> {

    const {
        getBaseInfo,
        getPreSceneInfo = (args: CalculateParamValArgs) => ({ hasPreScene: false }),
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
            ...getPreSceneInfo(args),
            ...getContent(args, duration, libraries, moreArgs),
            ...getAudio(args, duration, libraries, moreArgs),
        }
    }
}

function getAleasSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {
    return getTheatreDuTempsSceneTemplates(libraries);
}