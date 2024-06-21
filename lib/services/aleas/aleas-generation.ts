import { getFixtureCollection, getLightingPlan, getShow } from "../api/show-control-api";
import { HasId, Named, ShortNamed } from "../core/types/utils";
import { randomBool, randomElement, randomInt, randomRange, sequence } from "../core/utils";
import { DmxValueSegment, Mappings, SceneInfo, ShowInfo } from "../dmx/showControl";
import { getAudioLibraryCollection, getInputProjectionLibraryCollection } from "./aleas-api";

export type RangeOrValue = number | Range;
type Range = [ number, number ];

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


export type AleasInputProjectionLibrariesCollection = {
    libraries: AleasInputProjectionLibrary[];
} & Named & ShortNamed & HasId;

export type AleasInputProjectionLibrary = {
    name: string;
    key: string;
    elements: string[];
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

type ProjectionType = "text" | "timer";

type ProjectionEltBase = {
    startTime: number;
}

type ProjectionTextElement = ProjectionEltBase & {
    type: "text";
    text: string;
    duration: number;
    fadeIn: number;
    fadeOut: number;
}

type ProjectionTimerElement = ProjectionEltBase & {
    type: "timer";
    timer: number;
}

type ProjectionElement = ProjectionTextElement | ProjectionTimerElement;
type ProjectionsElementsOrNoProjections = ({
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

type LoadedLibrary<T> = {
    [key: string]: T;
}

type LoadedLibraries = {
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
    
    const {
        intro: {
            duration,
        }
    } = args;

    const durationValue = getValue(duration);

    const intro = generateIntroOutro(durationValue, libraries);
    return intro;
}

function generateOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const {
        outro: {
            duration,
        }
    } = args;

    const durationValue = getValue(duration);

    const outro = generateIntroOutro(durationValue, libraries);
    return outro;
}

function generateIntroOutro(durationValue: number, libraries: LoadedLibraries): SceneData {
    const blackoutOffset = 3;
    const startOffset = 6.5;

    const lightAmplitude = 1;
    const introBaseScene = "pf chaud"
;    // const introBaseScene = "intro-outro-base";
    const lightFade = randomRange(0.2, 0.4);

    const introBaseElement: LightsElement = {
        scene: introBaseScene,
        amplitude: 1.0,
        level: createStandardLevel({
            duration: durationValue,
            fadeIn: 1,
            fadeOut: 1,
        }),
        elements: getValuesFromScene(libraries.dmxScenes, introBaseScene)
    }

    // const eltCount = 5;
    // const lightKeyFrames: KeyFrame[][] = sequence(eltCount, 1)
    //     .map(i => [
    //         [0, 0],
    //         [startOffset, 0]
    //     ]);

    // const durations = generateRandomDurations({
    //     totalDuration: durationValue - blackoutOffset - startOffset,
    //     range: [2, 5.5]
    // })

    // let trackIndex = randomInt(0, eltCount);
    // let time = startOffset;
    // durations.forEach((duration, i) => {
    //     lightKeyFrames[trackIndex].push(
    //         [time, 0],
    //         [time + lightFade, 1],
    //         [time + duration, 1],
    //         [time + duration + lightFade, 0]
    //     )

    //     const availableIndices = sequence(eltCount).filter(j => j !== trackIndex);
    //     const nextIndex = randomElement(availableIndices);
    //     trackIndex = nextIndex;

    //     time += duration;
    // });

    // lightKeyFrames.forEach(frames => frames.push(
    //     [durationValue - blackoutOffset + lightFade, 0],
    //     [durationValue, 0]
    // ))

    const lightsElements = [
        introBaseElement,
        // ...lightKeyFrames.map((keyFrames, i) => {
        //     const sceneName = `intro-outro-${(i + 1).toString().padStart(2, "0")}`;

        //     return {
        //         scene: sceneName,
        //         amplitude: lightAmplitude,
        //         level: keyFrames,
        //         elements: getValuesFromScene(libraries.dmxScenes, sceneName)
        //     }
        // })
    ];

    // const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

    const audioFadeIn = randomRange(1, 4);
    const audioFadeOut = randomRange(1, 4);
    const audioLevel = createStandardLevel({
        duration: durationValue,
        fadeIn: audioFadeIn,
        fadeOut: audioFadeOut,
    });

    return {
        templateName: "intro",
        duration: durationValue,
        info: "Intro scene",
        hasLights: true,
        lights: lightsElements,
        hasAudio: true,
        audio: [
            {
                track: "intro-01",
                startTime: 0,
                duration: durationValue,
                amplitude: 1.0,
                volume: audioLevel
            }
        ],
        hasProjections: false
    }
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

function getRandomProjectionInput(libraries: LoadedLibrary<AleasInputProjectionLibrary>): string {
    const lib = randomElement(Object.values(libraries));
    return randomElement(lib.elements);
}

function getRandomDuration(...durations: Range[]): number {
    const range = randomElement(durations);
    const duration = randomRange(range[0], range[1]);
    return duration;
}

function getWholeRangeAmplitude(...durations: Range[]): Range {
    const min = Math.min(...durations.map(d => d[0]));
    const max = Math.max(...durations.map(d => d[1]));

    return [min, max];
}

type HardCodedTemplateParts<TArgs> = {
    getBaseInfo: (args: CalculateParamValArgs) => SceneBaseInfo;
    getLights: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => LightsElementsOrNoLights;
    getAudio?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => AudioElementsOrNoAudio;
    getProjection?: (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: TArgs) => ProjectionsElementsOrNoProjections;
    getMoreArgs?: (args: CalculateParamValArgs, duration: number) => TArgs;
}

function makeSceneProvider<TArgs = any>(parts: HardCodedTemplateParts<TArgs>, libraries: LoadedLibraries): ParamProvider<SceneData> {

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

type GenerateRandomDurationsArgs = {
    totalDuration: number;
    range: Range;
}
function generateRandomDurations(args: GenerateRandomDurationsArgs): number[] {
    
    const { totalDuration, range } = args;

    const [min, max] = range;
        
    const result = [];
    
    let time = 0;
    
    while (time < totalDuration) {
        const duration = randomRange(min, max);
        time += duration;
        result.push(duration);
    }

    const contracted = contractTimes(result, totalDuration);
    return contracted;
}

function contractTimes(times: number[], totalDuration: number) {
    const totalTime = times.reduce((acc, n) => acc + n, 0);
    const ratio = totalDuration / totalTime;

    return times.map(n => n * ratio);
}

type GeneratePulseKeyFramesArgs = {
    duration: number;
    period: number;
    fade: number;
    range: Range;
}

function generatePulseKeyFrames(args: GeneratePulseKeyFramesArgs): KeyFrame[] {
    const {
        duration,
        period,
        fade,
        range
    } = args;

    let isMin = randomBool();
    let time = 0;

    const result: KeyFrame[] = [];

    while (time < duration) {
        const [value1, value2] = isMin ?
            [range[0], range[1]] :
            [range[1], range[0]];

        result.push(
            [time, value1],
            [time + fade, value2],
        );

        time += period;
        isMin = !isMin;
    }

    return result;
}

type GeneratePeriodicEventArgs = {
    totalDuration: number;
    period: number;
    duration: number;
    offset?: number;
}

function generatePeriodicEvent(args: GeneratePeriodicEventArgs): StartAndDuration[] {
    const {
        totalDuration,
        period,
        duration,
        offset = 0
    } = args;

    const result: StartAndDuration[] = [];

    let time = offset;
    
    while (time < totalDuration) {
        result.push({
            startTime: time,
            duration
        });

        time += period;
    }

    return result;
}


type GenerateAudioElementsArgs = {
    sceneDuration: number;
    audioDurationRange: Range;
    fadeDurationRange: Range;
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

    const intervals = generateIntermittentIntervals({
        totalDuration: sceneDuration,
        eventDurationRange: audioDurationRange,
        startMargin: startEndMargin,
        endMargin: startEndMargin,
        minSpaceBetweenEvents: minSpaceBetweenAudio,
        occurencesCap
    })

    const fadeIn = randomRange(fadeDurationRange[0], fadeDurationRange[1]);
    const fadeOut = randomRange(fadeDurationRange[0], fadeDurationRange[1]);
    const track = getRandomElementFromAudioLib(libraries.audioLibraries, ...audioLibraries);
    const audioElements: AudioElement[] = intervals.map(interval => {
        const {
            startTime,
            duration: eltDuration
        } = interval;

        return {
            track,
            startTime,
            duration: eltDuration,
            amplitude,
            volume: createStandardLevel({
                duration: eltDuration,
                fadeIn,
                fadeOut,
            })
        }
    });


    return audioElements;
}

type GenerateIntermittentIntervalsArgs = {
    totalDuration: number;
    eventDurationRange: Range;
    startMargin?: number;
    endMargin?: number;
    minSpaceBetweenEvents: number;
    occurencesCap?: number;
    maxUnusedOccurences?: number;
}

function generateIntermittentIntervals(args: GenerateIntermittentIntervalsArgs): StartAndDuration[] {
    const {
        totalDuration,
        eventDurationRange,
        startMargin = 0,
        endMargin = 0,
        minSpaceBetweenEvents,
        occurencesCap = 1000,
        maxUnusedOccurences = 2,
    } = args;

    const maxEventDuration = eventDurationRange[1];

    const remainingTimeAfterMaxDuration = totalDuration - maxEventDuration - (startMargin + endMargin);

    const maxOccurences = Math.min(
        1 + Math.floor(remainingTimeAfterMaxDuration / (minSpaceBetweenEvents + maxEventDuration)),
        occurencesCap
    );

    const minOccurences = Math.max(
        1,
        maxOccurences - maxUnusedOccurences
    );

    const occurences = randomInt(minOccurences, maxOccurences);

    const result: StartAndDuration[] = [];

    let currentLowerBound = startMargin;
    for (let i = 0 ; i < occurences ; i++) {

        const eltDuration = randomRange(eventDurationRange[0], eventDurationRange[1]);

        const remainingOccurences = occurences - (i + 1);

        const startTimeLB = currentLowerBound;
        const startTimeUB = totalDuration
            - (endMargin + remainingOccurences * (minSpaceBetweenEvents + maxEventDuration))
            - maxEventDuration;

        if (startTimeUB < startTimeLB) {
            throw new Error("Oops lower bound should be lower than upper bound");
        }
        const startTime = randomRange(startTimeLB, startTimeUB);

        result.push({
            startTime,
            duration: eltDuration,
        });

        currentLowerBound = startTime + eltDuration + minSpaceBetweenEvents;
    }

    return result;
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

            const durationRange = getWholeRangeAmplitude(...availableDurations);
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
                const amplitude = randomRange(0.6, 1.0);

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
                            amplitude,
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

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improEnSeine.scenes.standardScenes,
                improEnSeine.scenes.specials,
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
                const amplitude = 0.6;

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
                            amplitude,
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
                weight: 20,
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
            const templateName = "projection-input";
            const templateInfo = "Simple scene with a projection input";

            const availableDurations = [
                improEnSeine.durations.short,
                improEnSeine.durations.standard,
            ];

            const projectionDuration = 8;

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improEnSeine.scenes.standardScenes,
                improEnSeine.scenes.specials,
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
                const amplitude = 0.6;

                const scene = getRandomSceneFromScenes(availableScenes);
        
                const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

                const level = createStandardLevel({
                    duration: duration - projectionDuration,
                    fadeIn,
                    fadeOut,
                    offset: projectionDuration,
                });

                return {
                    hasLights: true,
                    lights: [
                        {
                            scene,
                            amplitude,
                            level,
                            elements: valueSegments
                        }
                    ]
                }
            }

            const getProjection = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ProjectionsElementsOrNoProjections => {
                    
                const text = getRandomProjectionInput(libraries.inputProjectionLibraries);
                return {
                    hasProjections: true,
                    projections: [
                        {
                            type: "text",
                            text,
                            startTime: 0,
                            duration: projectionDuration,
                            fadeIn: 1.0,
                            fadeOut: 1.0
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
                    } = args;

                    return progress > 0.20;
                },
                weight: (args: CalculateParamValArgs) => {

                    const {
                        progress,
                        history
                    } = args;

                    const penalty = 9;
                    const occurences = history.counts[templateName] || 0;

                    const base = 50;
                    const slope = 5;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: [
                    "projections"
                ],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getProjection
                }, libraries),
                durationRange
            }
        },
        "confessionnal": function(libraries: LoadedLibraries): AleasSceneTemplate { 
            const templateName = "confessionnal";
            const templateInfo = "Confessionnal";

            const thresholds = [ 0.33, 0.66];
            const confessionnalsCount = thresholds.length;

            const confessionnalDuration = 120;

            const durationRange: Range = [confessionnalDuration, confessionnalDuration];
            const confessionnalScene = improEnSeine.scenes.confessionnal;

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = confessionnalDuration;
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number): LightsElementsOrNoLights => {
        
                const fadeIn = randomRange(1, 3);
                const fadeOut = randomRange(3, 5);
                const amplitude = 1;

                const scene = confessionnalScene;
        
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
                            amplitude,
                            level,
                            elements: valueSegments
                        }
                    ]
                }
            }

            const getProjection = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ProjectionsElementsOrNoProjections => {
                        
                return {
                    hasProjections: true,
                    projections: [
                        {
                            type: "timer",
                            timer: confessionnalDuration,
                            startTime: 0,
                        }
                    ]
                }
            }

            return {
                name: templateName,
                isPriority: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        history
                    } = args;

                    const occurences = history.counts[templateName] || 0;

                    return (progress > thresholds[0] && occurences < 1)
                        || (progress > thresholds[1] && occurences < 2);
                },
                enabled: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        history
                    } = args;

                    const occurences = history.counts[templateName] || 0;

                    return (progress > thresholds[0] && occurences < 1)
                        || (progress > thresholds[1] && occurences < 2);
                },
                weight: 0,
                requiredFeatures: [
                    "confessionnal",
                    "projections"
                ],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getProjection,
                }, libraries),
                durationRange
            }
        },
        "crudes": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "crudes";
            const templateInfo = "Crude scenes";

            const availableDurations = [
                improEnSeine.durations.short,
                improEnSeine.durations.standard,
                improEnSeine.durations.long
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improEnSeine.scenes.crudes
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
        
                const fadeIn = randomRange(2, 5);
                const fadeOut = randomRange(2, 5);
                const amplitude = randomRange(0.6, 1.0);

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
                            amplitude,
                            level,
                            elements: valueSegments
                        }
                    ]
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const audioOdds = 0.6;

                if (Math.random() > audioOdds) {
                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: [20, 60],
                        fadeDurationRange: [1.5, 3.0],
                        amplitude: 0.7,
                        startEndMargin: 10,
                        minSpaceBetweenAudio: 40,
                        audioLibraries: ["aleas-general"]
                    });

                    return {
                        hasAudio: true,
                        audio
                    }
                }
                else {
                    return {
                        hasAudio: false
                    }
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                    } = args;
                    

                    return progress > 0.08;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        history
                    } = args;

                    const penalty = 5;
                    const occurences = history.counts[templateName] || 0;

                    const base = 10;
                    const slope = 20;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "crudes-alternates": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "crudes-alternates";
            const templateInfo = "Crude scenes - Alternate";

            const availableDurations = [
                improEnSeine.durations.short,
                improEnSeine.durations.standard,
                improEnSeine.durations.long
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const stepRangeSeed = [6, 10];
            const minMidDuration = 8;
            
            const availableScenes: string[][][] = [
                improEnSeine.scenes.crudesAlternates
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
        
                const fade = randomRange(2, 5);
                const amplitude = randomRange(0.6, 1.0);

                const sceneLib = randomElement(availableScenes);
                const scenes = randomElement(sceneLib);

                const seed = randomRange(stepRangeSeed[0], stepRangeSeed[1]);
                const midDuration = Math.max(
                    duration / seed,
                    minMidDuration
                );

                const steps = generateRandomDurations({
                    totalDuration: duration,
                    range: [midDuration / 2, midDuration * 1.5]
                });

                const trackCount = scenes.length;
                const stepsByTrack: KeyFrame[][] = sequence(trackCount).map(() => []);
                const init = randomInt(0, trackCount - 1);

                for (let i = 0; i < trackCount; i++) {

                    if (i !== init) {
                        stepsByTrack[i].push([0, 0]);
                    }
                }

                let time = 0;
                let j = init;
                for (let i = 0; i < steps.length ; i++, j++) {
                    const duration = steps[i];
                    
                    const trackIndex = j % trackCount;

                    stepsByTrack[trackIndex].push(
                        [time, 0.0],
                        [time + fade, 1.0],
                    );

                    if (i < steps.length - 1) {
                        stepsByTrack[trackIndex].push(
                            [time + duration, 1.0],
                            [time + duration + fade, 0.0]
                        );
                    }
                    else {
                        stepsByTrack[trackIndex].push(
                            [time + duration - fade, 1.0],
                            [time + duration, 0.0]
                        );
                    }

                    time += duration;
                }

        
                const lights: LightsElement[] = scenes.map((scene, i) => {
                    const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

                    return {
                        scene,
                        amplitude,
                        level: stepsByTrack[i],
                        elements: valueSegments
                    }
                });

                return {
                    hasLights: true,
                    lights
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const audioOdds = 0.6;

                if (Math.random() > audioOdds) {
                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: [20, 60],
                        fadeDurationRange: [1.5, 3.0],
                        amplitude: 0.7,
                        startEndMargin: 10,
                        minSpaceBetweenAudio: 40,
                        audioLibraries: ["aleas-general"]
                    });

                    return {
                        hasAudio: true,
                        audio
                    }
                }
                else {
                    return {
                        hasAudio: false
                    }
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                    } = args;

                    return progress > 0.15;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        history
                    } = args;

                    const occurences = history.counts[templateName] || 0;
                    const penalty = 8;

                    const base = 0;
                    const slope = 30;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "ultra-short": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "ultra-short";
            const templateInfo = "Scene with ultra short duration";
            
            const availableDurations = [
                improEnSeine.durations.ultraShort
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);
            
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
                        && occurences <= 2
                        && currentScene > 3
                        && progress < 0.9;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        history
                    } = args;

                    const occurences = history.counts[templateName] || 0;
                    const penalty = 20;

                    const base = 5;
                    const slope = 60;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                }, libraries),
                durationRange
            }
        },
        // "run-boy-run": function(libraries: LoadedLibraries): AleasSceneTemplate {
        //     const templateName = "run-boy-run";
        //     const templateInfo = "Make them run!";

        //     const availableDurations = [
        //         improEnSeine.durations.runBoyRun,
        //     ];
        //     const durationRange = getWholeRangeAmplitude(...availableDurations);

        //     const audioLibraries = [
        //         "aleas-wtf",
        //         "aleas-loud",
        //         "aleas-text"
        //     ];

        //     const blackoutOffset = 3;
        //     const stepRange: Range = [4, 11];

        //     const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        //         const duration = getRandomDuration(...availableDurations);
        
        //         return {
        //             templateName,
        //             duration,
        //             info: templateInfo
        //         }
        //     }
        
        //     const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
        
        //         const fade = randomRange(0.05, 0.3);
        //         const amplitude = randomRange(0.8, 1.0);
        //         const lvlFade = randomRange(0.5, 2);

        //         const beamAmplitude = randomRange(0.8, 1.0);

        //         const scenes = improEnSeine.scenes.douches.elements;

        //         const steps = generateRandomDurations({
        //             totalDuration: duration,
        //             range: stepRange
        //         });

        //         const trackCount = scenes.length;
        //         const stepsByTrack: KeyFrame[][] = sequence(trackCount).map(() => []);
        //         const init = randomInt(0, trackCount - 1);

        //         for (let i = 0; i < trackCount; i++) {

        //             if (i !== init) {
        //                 stepsByTrack[i].push([0, 0]);
        //             }
        //         }

        //         let time = 0;
        //         for (let i = 0, j = init; i < steps.length ; i++, j++) {
        //             const duration = steps[i];

        //             const trackIndex = j % trackCount;

        //             stepsByTrack[trackIndex].push(
        //                 [time, 0.0],
        //                 [time + fade, 1.0],
        //             );

        //             if (i < steps.length - 1) {
        //                 stepsByTrack[trackIndex].push(
        //                     [time + duration, 1.0],
        //                     [time + duration + fade, 0.0]
        //                 );
        //             }
        //             else {
        //                 stepsByTrack[trackIndex].push(
        //                     [time + duration - fade, 1.0],
        //                     [time + duration, 0.0]
        //                 );
        //             }

        //             time += duration;
        //         }

        //         const baseScene = improEnSeine.scenes.douches.base;
        //         const doucheBase: LightsElement = {
        //             scene: baseScene,
        //             amplitude: 1.0,
        //             level: [
        //                 [0, 1],
        //                 [duration - blackoutOffset - lvlFade, 1],
        //                 [duration - blackoutOffset, 0]
        //             ],
        //             elements: getValuesFromScene(libraries.dmxScenes, baseScene)
        //         }

        //         const beamScene = improEnSeine.scenes.douches.beam;
        //         const doucheBeam: LightsElement = {
        //             scene: beamScene,
        //             amplitude: beamAmplitude,
        //             level: [
        //                 [0, 1],
        //                 [duration, 1]
        //             ],
        //             elements: getValuesFromScene(libraries.dmxScenes, beamScene)
        //         }

        //         const douchesLights: LightsElement[] = scenes.map((scene, i) => {
        //             const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

        //             return {
        //                 scene,
        //                 amplitude,
        //                 level: stepsByTrack[i],
        //                 elements: valueSegments
        //             }
        //         });

        //         return {
        //             hasLights: true,
        //             lights: [
        //                 doucheBase,
        //                 doucheBeam,
        //                 ...douchesLights
        //             ]
        //         }
        //     }

        //     const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

        //         const lib = randomElement(audioLibraries);
        //         const track = getRandomElementFromAudioLib(libraries.audioLibraries, lib);

        //         return {
        //             hasAudio: true,
        //             audio: [
        //                 {
        //                     track,
        //                     startTime: 0,
        //                     duration,
        //                     amplitude: 1.0,
        //                     volume: createStandardLevel({
        //                         duration,
        //                         fadeIn: 1,
        //                         fadeOut: blackoutOffset,
        //                     })
        //                 }
        //             ]
        //         }
        //     }

        //     return {
        //         name: templateName,
        //         isPriority: false,
        //         enabled: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;

        //             return progress > 0.4 && occurences < 2;
        //         },
        //         weight: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;
        //             const penalty = 20;

        //             const base = 10;
        //             const slope = 80;

        //             return Math.max(
        //                 base + progress * slope - occurences * penalty,
        //                 0
        //             );
        //         },
        //         requiredFeatures: [],
        //         value: makeSceneProvider({
        //             getBaseInfo,
        //             getLights,
        //             getAudio
        //         }, libraries),
        //         durationRange
        //     }
        // },
        "pf-bascule-ambient": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "pf-bascule-ambient";
            const templateInfo = "Plein Feux - Bascule - Ambient";

            const smokeDuration = 7;

            const basculeRange: Range = [15, 30];

            const availableDurations = [
                improEnSeine.durations.standard,
                improEnSeine.durations.long
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const standardScenes = [
                improEnSeine.scenes.standardScenes
            ]

            const ambientScenes = [
                improEnSeine.scenes.ambients.fullColor,
                improEnSeine.scenes.ambients.bicolor,
            ];

            const basculeAudioLibs = [
                "aleas-loud",
            ]

            type PfBasculeAmbientMoreArgs = {
                bascules: StartAndDuration[];
                fadeToAmbient: number;
                fadeToPF: number;
            }

            const getMoreArgs = (args: CalculateParamValArgs, duration: number) => {
                const bascules: StartAndDuration[] = generateIntermittentIntervals({
                    totalDuration: duration,
                    eventDurationRange: basculeRange,
                    startMargin: 30,
                    endMargin: 10,
                    minSpaceBetweenEvents: 20,
                    occurencesCap: 4
                });

                const fadeToAmbient = randomRange(1, 3);
                const fadeToPF = randomRange(2, 5);

                return {
                    bascules,
                    fadeToAmbient,
                    fadeToPF
                }
            }

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: PfBasculeAmbientMoreArgs): LightsElementsOrNoLights => {
                
                const {
                    bascules,
                    fadeToAmbient,
                    fadeToPF
                } = moreArgs;

                const ambientAmplitude = randomRange(0.6, 0.8);
                const pfAmplitude = randomRange(0.6, 1.0);
                const blackoutFade = randomRange(2.0, 5.0);

                const smokeFade = 0.1;

                const pfScene = getRandomSceneFromScenes(standardScenes);
                const ambientScene = getRandomSceneFromScenes(ambientScenes);

                const pfKeyFrames: KeyFrame[] = [];
                const ambientKeyFrames: KeyFrame[] = [];
                const smokeKeyFrames: KeyFrame[] = [];

                pfKeyFrames.push(
                    [0, 0],
                    [fadeToPF, 1],
                )

                ambientKeyFrames.push(
                    [0, 0],
                )

                smokeKeyFrames.push(
                    [0, 0],
                )

                for (const bascule of bascules) {
                    const {
                        startTime,
                        duration: eltDuration
                    } = bascule;

                    pfKeyFrames.push(
                        [startTime, 1],
                        [startTime + fadeToAmbient, 0],
                        [startTime + eltDuration - fadeToPF, 0],
                        [startTime + eltDuration, 1]
                    );

                    ambientKeyFrames.push(
                        [startTime, 0],
                        [startTime + fadeToAmbient, 1],
                        [startTime + eltDuration - fadeToPF, 1],
                        [startTime + eltDuration, 0]
                    );

                    smokeKeyFrames.push(
                        [startTime, 0],
                        [startTime + smokeFade, 1],
                        [startTime + smokeDuration, 1],
                        [startTime + smokeDuration + smokeFade, 0]
                    );
                }

                pfKeyFrames.push(
                    [duration - blackoutFade, 1],
                    [duration, 0]
                );

                const pfElement: LightsElement = {
                    scene: pfScene,
                    amplitude: pfAmplitude,
                    level: pfKeyFrames,
                    elements: getValuesFromScene(libraries.dmxScenes, pfScene)
                }

                const ambientElement: LightsElement = {
                    scene: ambientScene,
                    amplitude: ambientAmplitude,
                    level: ambientKeyFrames,
                    elements: getValuesFromScene(libraries.dmxScenes, ambientScene)
                }

                const smokeScene = improEnSeine.scenes.smoke;
                const smokeElement: LightsElement = {
                    scene: smokeScene,
                    amplitude: 1.0,
                    level: smokeKeyFrames,
                    elements: getValuesFromScene(libraries.dmxScenes, smokeScene)
                }

                return {
                    hasLights: true,
                    lights: [
                        pfElement,
                        ambientElement,
                        smokeElement
                    ]
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: PfBasculeAmbientMoreArgs): AudioElementsOrNoAudio => {

                const { bascules } = moreArgs;

                const audioFade = randomRange(0.5, 1.5);
                const audioAmplitude = 0.9;

                const audioLib = randomElement(basculeAudioLibs);
                const track = getRandomElementFromAudioLib(libraries.audioLibraries, audioLib);

                const audio = bascules.map(bascule => {
                    const { startTime, duration: eltDuration } = bascule;

                    return {
                        track,
                        startTime,
                        duration: eltDuration,
                        amplitude: audioAmplitude,
                        volume: createStandardLevel({
                            duration: eltDuration,
                            fadeIn: audioFade,
                            fadeOut: audioFade,
                        })
                    }
                })

                return {
                    hasAudio: true,
                    audio
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                    } = args;

                    return progress > 0.25;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        history
                    } = args;

                    const occurences = history.counts[templateName] || 0;
                    const penalty = 4;

                    const base = 25;
                    const slope = 70;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: ["smokeMachine"],
                value: makeSceneProvider<PfBasculeAmbientMoreArgs>({
                    getBaseInfo,
                    getLights,
                    getAudio,
                    getMoreArgs
                }, libraries),
                durationRange
            }
        },
        "ambient-with-smoke": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "ambient-with-smoke";
            const templateInfo = "Ambient with smoke";

            const smokeDuration = 5.5;

            const smokeInterval = 40;

            const availableDurations = [
                improEnSeine.durations.short,
                improEnSeine.durations.standard,
                improEnSeine.durations.long,
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                improEnSeine.scenes.ambients.fullColor,
                improEnSeine.scenes.ambients.bicolor,
            ];
            const audioLibs = [
                "aleas-ambient",
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }
        
            const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
                
                generatePeriodicEvent({
                    totalDuration: 100,
                    period: 40,
                    duration: 10
                })

                const ambientAmplitude = randomRange(0.4, 0.7);
                const blackoutOffset = 3;
                const fadeIn = randomRange(2, 5);
                const fadeOut = randomRange(2, 5);

                const smokeFade = 0.1;

                const ambientScene = getRandomSceneFromScenes(ambientScenes);

                const ambientElement: LightsElement = {
                    scene: ambientScene,
                    amplitude: ambientAmplitude,
                    level: createStandardLevel({
                        duration: duration - blackoutOffset,
                        fadeIn,
                        fadeOut,
                    }),
                    elements: getValuesFromScene(libraries.dmxScenes, ambientScene)
                }

                const smokeKeyFrames: KeyFrame[] = []; 
                const events = generatePeriodicEvent({
                    totalDuration: duration,
                    period: smokeInterval,
                    duration: smokeDuration
                })
                events.forEach(event => {
                    const { startTime } = event;

                    smokeKeyFrames.push(
                        [startTime, 0],
                        [startTime + smokeFade, 1],
                        [startTime + smokeDuration, 1],
                        [startTime + smokeDuration + smokeFade, 0]
                    );
                });

                const smokeScene = improEnSeine.scenes.smoke;
                const smokeElement: LightsElement = {
                    scene: smokeScene,
                    amplitude: 1.0,
                    level: smokeKeyFrames,
                    elements: getValuesFromScene(libraries.dmxScenes, smokeScene)
                }

                return {
                    hasLights: true,
                    lights: [
                        ambientElement,
                        smokeElement
                    ]
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const fadeIn = randomRange(2, 5);
                const fadeOut = randomRange(2, 4);
                const audioAmplitude = 0.3;

                const audioLib = randomElement(audioLibs);
                const track = getRandomElementFromAudioLib(libraries.audioLibraries, audioLib);

                return {
                    hasAudio: true,
                    audio: [{
                        track,
                        startTime: 0,
                        duration,
                        amplitude: audioAmplitude,
                        volume: createStandardLevel({
                            duration,
                            fadeIn,
                            fadeOut,
                        })
                    }]
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                    } = args;

                    return progress > 0.23;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        history
                    } = args;

                    const occurences = history.counts[templateName] || 0;
                    const penalty = 10;

                    const base = 20;
                    const slope = 20;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: ["smokeMachine"],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getAudio,
                }, libraries),
                durationRange
            }
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
            "double-rasants",
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
        runBoyRun: [30, 110],
        standard: [90, 300],
        long: [350, 600],
    } satisfies { [key: string]: Range }
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
