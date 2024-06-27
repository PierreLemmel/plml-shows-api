import { setDocument } from "../api/firebase";
import { getFixtureCollection, getLightingPlan, getShow } from "../api/show-control-api";
import { HasId, Named, ShortNamed } from "../core/types/utils";
import { randomRange } from "../core/utils";
import { DmxValueSegment, Mappings, SceneInfo, ShowInfo } from "../dmx/showControl";
import { getAudioLibraryCollection, getInputProjectionLibraryCollection } from "./aleas-api";
import { createStandardLevel } from "./aleas-generation-utils";
import { generateImproEnSeineIntroScene, generateImproEnSeineOutroScene, getImproEnSeinePostshowElements, getImproEnSeinePreshowElements, getImproEnSeineSceneTemplates, getImproEnSeineStaticElements } from "./templates/impro-en-seine";

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
] as const;

export type AleasFeatures = typeof aleasFeatures[number];

export type AleasFeaturesMap = {
    [key in AleasFeatures]: boolean;
};

type GenerateAleasPrePostShowArgs = {
    scene: string;
    fade: Fade;
}

export type GenerateAleasPreShowArgs = GenerateAleasPrePostShowArgs;
export type GenerateAleasPostShowArgs = GenerateAleasPrePostShowArgs;

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


export type AleasInputProjectionLibrariesCollection = {
    libraries: AleasInputProjectionLibrary[];
} & Named & ShortNamed & HasId;

export type AleasInputProjectionLibrary = {
    name: string;
    key: string;
    elements: string[];
}


export type SceneBaseInfo = {
    templateName: string;
    duration: number;
    info: string;
}

export type LightsElement = {
    scene: string;
    amplitude: number;
    level: KeyFrame[];
    elements: DmxValueSegment[];
}

export type LightsElementsOrNoLights = ({
    hasLights: true,
    lights: LightsElement[],
} | { hasLights: false })

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

type ProjectionType = "text" | "timer";

type ProjectionEltBase = {
    type: ProjectionType;
    startTime: number;
}

export type ProjectionTextElement = ProjectionEltBase & {
    type: "text";
    text: string;
    duration: number;
    fadeIn: number;
    fadeOut: number;
}

export type ProjectionTimerElement = ProjectionEltBase & {
    type: "timer";
    timer: number;
}

export type ProjectionElement = ProjectionTextElement | ProjectionTimerElement;
export type ProjectionsElementsOrNoProjections = ({
    hasProjections: true,
    projections: ProjectionElement[]
} | { hasProjections: false })

export type SceneData = SceneBaseInfo
    & LightsElementsOrNoLights
    & AudioElementsOrNoAudio
    & ProjectionsElementsOrNoProjections;
export type AleasShowScene = {
    name: string,
    displayName: string
}
    & SceneData;

export type AleasShowStaticElements = {
    lights?: {
        scene: string;
        elements: DmxValueSegment[];
    }
}

type AleasPrePostShowElements = {

}

export type AleasPreshowElements = AleasPrePostShowElements;
export type AleasPostShowElements = AleasPrePostShowElements;

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


export type AleasSceneTemplate = {
    name: string;
    isPriority: ParamProviderOrValue<boolean>;
    enabled: ParamProviderOrValue<boolean>;
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

async function getDmxShowInfo(showName: string, lightingPlan: string) {
    const dmxShow = await getShow(lightingPlan, showName);
    const lp = await getLightingPlan(lightingPlan);
    const fixtureColl = await getFixtureCollection("default");
    const lpInfo = Mappings.computeLightingPlanInfo(lp, fixtureColl);
    const dmxShowInfo: ShowInfo = Mappings.computeShowInfo(dmxShow, lpInfo);

    return dmxShowInfo;
}

export type LoadedLibrary<T> = {
    [key: string]: T;
}

export type LoadedLibraries = {
    dmxScenes: LoadedLibrary<SceneInfo>;
    audioLibraries: LoadedLibrary<AleasAudioLibrary>;
    inputProjectionLibraries: LoadedLibrary<AleasInputProjectionLibrary>;
}

async function loadLibraries(showName: string, lightingPlan: string): Promise<LoadedLibraries> {
    const dmxShowInfo = await getDmxShowInfo(showName, lightingPlan);
    const audioLibrary = await getAudioLibraryCollection("aleas-2024");
    const inputLibrary = await getInputProjectionLibraryCollection("aleas-2024");

    const dmxScenes = dmxShowInfo.scenes.reduce((acc, scene) => {
        acc[scene.name] = scene;
        return acc;
    }, {} as LoadedLibrary<SceneInfo>);

    const audioLibraries = audioLibrary.libraries.reduce((acc, library) => {
        acc[library.key] = library;
        return acc;
    }, {} as LoadedLibrary<AleasAudioLibrary>);

    const inputProjectionLibraries = inputLibrary.libraries.reduce((acc, library) => {
        acc[library.key] = library;
        return acc;
    }, {} as LoadedLibrary<AleasInputProjectionLibrary>);

    const libraries: LoadedLibraries = {
        dmxScenes,
        audioLibraries,
        inputProjectionLibraries
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
    const intro = generateIntroScene(args, libraries);

    currentTime += intro.duration;
    currentTime += blackoutDurationValue;

    scenes.push({
        ...intro,
        name: "Intro",
        displayName: "Intro"
    });

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

        const newOccurencesCount = (history.counts[next.name] || 0) + 1;
        history.counts[next.name] = newOccurencesCount;

        scenes.push({
            name: `Scene-${(currentScene + 1).toString().padStart(2, "0")}`,
            displayName: `Scene-${(currentScene + 1).toString().padStart(2, "0")} - ${next.name} - ${newOccurencesCount.toString().padStart(2, "0")}`,
            ...nextScene
        });

        currentTime += nextScene.duration;
        currentTime += blackoutDurationValue;

        currentScene++;
    }

    const outro = generateOutroScene(args, libraries);

    scenes.push({
        ...outro,
        name: "Outro",
        displayName: "Outro"
    });

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

export async function generateSceneFromTemplate(args: GenerateAleasShowArgs, templateName: string): Promise<SceneData> {

    const {
        show: {
            lightingPlan,
            showName
        },
    } = args;


    const argsValues = computeShowArgsValues(args);

    
    const libraries = await loadLibraries(showName, lightingPlan);
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
        }
    }

    const instantiatedTemplate = instantiateTemplate(template, cpva);

    const result = calculateParamVal(instantiatedTemplate.value, cpva);

    return result;
}

function generateIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    return generateImproEnSeineIntroScene(args, libraries);
}

function generateOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    return generateImproEnSeineOutroScene(args, libraries);
}



export async function generateIntroSceneForTest(args: GenerateAleasShowArgs): Promise<SceneData> {
    const {
        show: {
            lightingPlan,
            showName
        },
    } = args;

    const libraries = await loadLibraries(showName, lightingPlan);

    return generateIntroScene(args, libraries);
}

export async function generateOutroSceneForTest(args: GenerateAleasShowArgs): Promise<SceneData> {
    const {
        show: {
            lightingPlan,
            showName
        },
    } = args;

    const libraries = await loadLibraries(showName, lightingPlan);

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
        isPriority: calculateParamVal(isPriority, args),
        enabled: calculateParamVal(enabled, args),
        weight: calculateParamVal(weight, args),
        durationRange: calculateParamVal(durationRange, args),
        value
    }
}

function getNextElementFromTemplates(templates: AleasSceneTemplate[], features: Partial<AleasFeaturesMap>, args: CalculateParamValArgs): AleasSceneInstatiatedTemplate {

    const instantiatedTemplates: AleasSceneInstatiatedTemplate[] = templates
        .filter(template => {
            const {
                requiredFeatures = []
            } = template;
            
            const hasRequiredFeatures = requiredFeatures.every(feature => features[feature] === true);
            return hasRequiredFeatures;
        })
        .map(template => {
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
    getLights: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => LightsElementsOrNoLights;
    getAudio?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => AudioElementsOrNoAudio;
    getProjection?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => ProjectionsElementsOrNoProjections;
    getMoreArgs?: (args: CalculateParamValArgs, duration: number) => TArgs;
}

export function makeSceneProvider<TArgs = any>(parts: HardCodedTemplateParts<TArgs>, libraries: LoadedLibraries): ParamProvider<SceneData> {

    const {
        getBaseInfo,
        getLights,
        getAudio = () => ({ hasAudio: false }),
        getProjection = () => ({ hasProjections: false }),
        getMoreArgs = () => { return {} as any;}
    } = parts;

    return (args: CalculateParamValArgs) => {
        const baseInfo = getBaseInfo(args);
        const { duration } = baseInfo;

        const moreArgs = getMoreArgs(args, duration);

        return {
            ...baseInfo,
            ...getLights(args, duration, libraries, moreArgs),
            ...getAudio(args, duration, libraries, moreArgs),
            ...getProjection(args, duration, libraries, moreArgs)
        }
    }
}

function getAleasSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {
    return getImproEnSeineSceneTemplates(libraries);
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

