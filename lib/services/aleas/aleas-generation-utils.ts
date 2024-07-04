import { randomBool, randomElement, randomInt, randomRange } from "../core/utils";
import { DmxValueSegment, SceneInfo } from "../dmx/showControl";
import { Range, LoadedLibraries, LoadedLibrary, AleasAudioLibrary, AleasInputProjectionLibrary, KeyFrame, StartAndDuration, AudioElement } from "./aleas-generation"

export function getRandomSceneFromScenes(libraries: ScenesGroup): string {
    const eltOrSubgroup = randomElement(libraries);

    if (typeof eltOrSubgroup === "string") {
        const scene = eltOrSubgroup;
        return scene;
    }
    else {
        const subGroup = eltOrSubgroup;
        return getRandomSceneFromScenes(subGroup);
    }
}

export function getRandomStepsContainerFromGroup(group: StepsContainerGroup): StepsContainer {

    const eltOrSubgroup = randomElement(group);

    if (Array.isArray(eltOrSubgroup[0])) {
        const subGroup = eltOrSubgroup as StepsContainerGroup;
        return getRandomStepsContainerFromGroup(subGroup);
    }
    else {
        const container = eltOrSubgroup as StepsContainer;
        return container;
    }

}


export function getValuesFromScene(library: LoadedLibrary<SceneInfo>, scene: string): DmxValueSegment[] {
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

export function getRandomElementFromAudioLib(libraries: LoadedLibrary<AleasAudioLibrary>, ...libs: string[]): string {
    const libName = randomElement(libs);
    const lib = libraries[libName];
    const index = randomInt(0, lib.count);

    return `${libName}-${(index + 1).toString().padStart(2, "0")}`;
}

export function getRandomProjectionInput(libraries: LoadedLibrary<AleasInputProjectionLibrary>): string {
    const lib = randomElement(Object.values(libraries));
    return randomElement(lib.elements);
}

export function getRandomDuration(...durations: Range[]): number {
    const range = randomElement(durations);
    const duration = randomRange(range[0], range[1]);
    return duration;
}

export function getWholeRangeAmplitude(...durations: Range[]): Range {
    const min = Math.min(...durations.map(d => d[0]));
    const max = Math.max(...durations.map(d => d[1]));

    return [min, max];
}

export type CreateLevelArgs = {
    duration: number;
    fadeIn: number;
    fadeOut: number;
    offset?: number;
    level?: number;
}

export function createStandardLevel(args: CreateLevelArgs): KeyFrame[] {

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

export type GenerateRandomDurationsArgs = {
    totalDuration: number;
    range: Range;
}

export function generateRandomDurations(args: GenerateRandomDurationsArgs): number[] {
    
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

export function contractTimes(times: number[], totalDuration: number) {
    const totalTime = times.reduce((acc, n) => acc + n, 0);
    const ratio = totalDuration / totalTime;

    return times.map(n => n * ratio);
}


export type GeneratePulseKeyFramesArgs = {
    duration: number;
    period: number;
    fade: number;
    range: Range;
}

export function generatePulseKeyFrames(args: GeneratePulseKeyFramesArgs): KeyFrame[] {
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

export type GeneratePeriodicEventArgs = {
    totalDuration: number;
    period: number;
    duration: number;
    offset?: number;
}

export function generatePeriodicEvent(args: GeneratePeriodicEventArgs): StartAndDuration[] {
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

export type ScenesGroup = (string|ScenesGroup)[];

export type StepsContainer = string[]
export type StepsContainerGroup = (StepsContainer|StepsContainerGroup)[]

export function isSubGroup(group: StepsContainerGroup): group is StepsContainerGroup {
    return Array.isArray(group[0]);
}

export type GenerateAudioElementsArgs = {
    sceneDuration: number;
    audioDurationRange: Range;
    fadeDurationRange: Range;
    amplitude: number;
    startEndMargin: number;
    minSpaceBetweenAudio: number;
    occurencesCap?: number;
    audioLibraries: string[];
}

export function generateAudioElements(libraries: LoadedLibraries, args: GenerateAudioElementsArgs): AudioElement[] {

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


export type GenerateIntermittentIntervalsArgs = {
    totalDuration: number;
    eventDurationRange: Range;
    startMargin?: number;
    endMargin?: number;
    minSpaceBetweenEvents: number;
    occurencesCap?: number;
    maxUnusedOccurences?: number;
}

export function generateIntermittentIntervals(args: GenerateIntermittentIntervalsArgs): StartAndDuration[] {
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