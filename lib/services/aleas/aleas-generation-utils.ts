import { RgbColor } from "react-colorful";
import { clamp } from "../core/maths";
import { Color } from "../core/types/rgbColor";
import { notImplemented, random01, randomBool, randomElement, randomInt, randomRange, sequence } from "../core/utils";
import { Range, LoadedLibraries, LoadedLibrary, AleasAudioLibrary, AleasInputProjectionLibrary, KeyFrame, StartAndDuration, AudioElement, AleasContentScene, ContentElement, ContentFadeElement, ContentParamElement, ContentStepElement, ContentValueElement, AleasContentLibraryFloatParam, AleasContentLibraryIntParam, AleasContentLibraryStringParam, AleasContentLibraryBoolParam, AleasContentLibraryColorParam, RangeOrValue, CalculateParamValArgs, ColorKeyFrame, StringKeyFrame, AleasMonologueLibrary, AleasMonologue } from "./aleas-generation"

export const getValue = (value: RangeOrValue): number => (Array.isArray(value)) ? randomRange(value[0], value[1]) : value;

export function getRandomElementFromAudioLib(libraries: LoadedLibrary<AleasAudioLibrary>, ...libs: string[]): string {

    const libName = randomElement(libs);
    const lib = libraries[libName];
    const index = randomInt(0, lib.count);

    return `${libName} - ${(index + 1).toString().padStart(3, "0")}`;
}

export type ScenesGroup = (string|ScenesGroup)[];
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

export function getRandomProjectionInput(libraries: LoadedLibrary<AleasInputProjectionLibrary>): string {
    const lib = randomElement(Object.values(libraries));
    return randomElement(lib.elements);
}

export function getRandomMonologue(libraries: LoadedLibrary<AleasMonologueLibrary>): AleasMonologue {
    const lib = randomElement(Object.values(libraries));
    return randomElement(lib.monologues);
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

export function getFade(...fades: Range[]): number {
    const [min, max] = randomElement(fades);
    return randomRange(min, max);
}

export type CreateStandardLevelArgs = {
    duration: number;
    fadeIn: RangeOrValue;
    fadeOut: RangeOrValue;
    offset?: number;
    level?: number;
}

export function createStandardLevel(args: CreateStandardLevelArgs): KeyFrame[] {

    const {
        duration,
        fadeIn: fadeInRov,
        fadeOut: fadeOutRov,
        offset = 0,
        level = 1.0
    } = args;

    const fadeIn = getValue(fadeInRov);
    const fadeOut = getValue(fadeOutRov);

    return [
        [offset + 0.0, 0.0],
        [offset + fadeIn, level],
        [offset + duration - fadeOut, level],
        [offset + duration, 0.0]
    ];
}

export type CreatePulseLevelArgs = {
    duration: number;
    range: Range;
    period: number;
    offset?: number;
}

export function createPulseLevel(args: CreatePulseLevelArgs): KeyFrame[] {
    const result: KeyFrame[] = [];

    const {
        duration,
        range: [minValue, maxValue],
        period,
        offset
    } = args;

    const halfPeriod = period / 2;

    let goUp = true;
    let time = 0;

    if (offset) {
        const trueOffset = offset % period;
        goUp = trueOffset < halfPeriod ? true : false;

        if (goUp) {
            const val = minValue + ((halfPeriod - trueOffset) / halfPeriod) * (maxValue - minValue);

            result.push([0, val]);
        }
        else {
            const val = maxValue - ((halfPeriod - trueOffset) / halfPeriod) * (maxValue - minValue);

            result.push([0, val]);
        }

        goUp = !goUp;

        time = trueOffset;
    }

    while (time < duration) {

        const val = goUp ? minValue : maxValue;
        result.push([time, val])

        time += halfPeriod;
        goUp = !goUp;
    }

    const remaining = duration - time;

    const a = remaining / halfPeriod;
    const lastVal = goUp ?
        minValue + a * (maxValue - minValue) : 
        maxValue - a * (maxValue - minValue)

    result.push([duration, lastVal])

    return result;
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


export type KeyFramesFromIntervalsArgs = {
    intervals: StartAndDuration[];
    duration: number;
    fadeIn: RangeOrValue;
    fadeOut: RangeOrValue;
    intervalValue: number;
    outsideOfIntervalValue: number;
    inIntervalOffset?: number;
    initialValue?: number;
    finalValue?: number;
}

export function keyFramesFromIntervals(args: KeyFramesFromIntervalsArgs): KeyFrame[] {

    const {
        intervals,
        duration,
        fadeIn: fadeInRov,
        fadeOut: fadeOutRov,
        intervalValue,
        outsideOfIntervalValue,
        inIntervalOffset: offset = 0,
        initialValue,
        finalValue
    } = args;

    const fadeIn = getValue(fadeInRov);
    const fadeOut = getValue(fadeOutRov);

    const result: KeyFrame[] = [];

    if (initialValue !== undefined) {
        result.push([0.0, initialValue]);
        result.push([fadeIn, outsideOfIntervalValue]);
    } 
    else {
        result.push([0.0, outsideOfIntervalValue]);
    }

    for (const interval of intervals) {
        const {
            startTime,
            duration
        } = interval;

        const correctedStartTime = startTime + offset;
        const correctedDuration = duration - 2 * offset;

        result.push([correctedStartTime, outsideOfIntervalValue]);
        result.push([correctedStartTime + fadeIn, intervalValue]);

        result.push([correctedStartTime + correctedDuration - fadeOut, intervalValue]);
        result.push([correctedStartTime + correctedDuration, outsideOfIntervalValue]);
    }

    if (finalValue !== undefined) {
        result.push([duration - fadeOut, outsideOfIntervalValue]);
        result.push([duration, finalValue]);
    }
    else {
        result.push([duration, outsideOfIntervalValue]);
    }

    return result;
}

type ValuesRecord = {
    floats?: Record<string, number>;
    ints?: Record<string, number>;
    strings?: Record<string, string>;
    bools?: Record<string, boolean>;
    colors?: Record<string, RgbColor>;
}

export type VKFRecordElement = {
    type: "float";
    frames: KeyFrame[];
} | {
    type: "color";
    frames: ColorKeyFrame[];
} | {
    type: "string";
    frames: StringKeyFrame[];
}

export type VKFRecord = Record<string, VKFRecordElement>;

export type GenerateContentElementArgs = {
    scene: string;
    duration: number;
    fadeIn: RangeOrValue;
    fadeOut: RangeOrValue;

    stepsKeyFrames?: KeyFrame[][];
    paramValues?: ValuesRecord;
    valuesKeyFrames?: VKFRecord;
}

export function generateContentElement(library: LoadedLibrary<AleasContentScene>, args: GenerateContentElementArgs): ContentElement {

    const {
        scene,
        duration,
        fadeIn: globalFadeInRov,
        fadeOut: globalFadeOutRov,
        stepsKeyFrames,
        paramValues,
        valuesKeyFrames
    } = args;

    const sceneContent = library[scene];

    const globalFadeIn = getValue(globalFadeInRov);
    const globalFadeOut = getValue(globalFadeOutRov);

    const {
        name: sceneName,
        projectIndex,
        fades: fadeDefs,
        params: paramDefs,
        steps: stepDefs,
        values: valueDefs
    } = sceneContent;

    const fades: ContentFadeElement[] = (fadeDefs !== undefined && fadeDefs.length > 1) ? fadeDefs.map(def => {
        const {
            elements,
            relativeOffset
        } = def;

        const offsetIn = relativeOffset * globalFadeIn;
        const offsetOut = relativeOffset * globalFadeOut;

        const value = createStandardLevel({
            offset: offsetIn,
            duration: duration - (offsetIn + offsetOut),
            fadeIn: globalFadeIn,
            fadeOut: globalFadeOut
        })

        return {
            elements,
            value
        }
    }) : [
        {
            elements: ["master"],
            value: createStandardLevel({
                duration,
                fadeIn: globalFadeIn,
                fadeOut: globalFadeOut
            })
        }
    ];



    let params: ContentParamElement[]|undefined;
    
    if (paramDefs && paramDefs.length > 0) {


        const calculatedValues: ValuesRecord = { }

        const calculateFloatValue = (def: AleasContentLibraryFloatParam): number => {

            const {
                name: paramName,
                value,
                link,
                range: [rangeMin, rangeMax] = [0, 1]
            } = def;

            const clampRange = (val: number) => clamp(val, rangeMin, rangeMax);

            if (paramValues?.floats?.[paramName] !== undefined) {
                return clampRange(paramValues.floats[paramName]);
            }

            if (value !== undefined) {
                return clampRange(value);
            }

            if (link) {

                const {
                    to,
                    offset
                } = link;

                const linkedValue = calculatedValues.floats?.[to];
                if (linkedValue) {

                    if (offset) {
                        const offsetVal = getValue(offset);
                        return clampRange(linkedValue + offsetVal);
                    }
                    else {
                        return clampRange(linkedValue);
                    }
                }
                else {
                    throw `Impossible to find linked value for '${paramName}': '${to}'`;
                }
            }

            return randomRange(rangeMin, rangeMax);
        }
        const getValueForFloat = (def: AleasContentLibraryFloatParam): number => {

            const val = calculateFloatValue(def);

            if (!calculatedValues.floats) {
                calculatedValues.floats = {};
            }

            calculatedValues.floats[def.name] = val;

            return val;
        };


        const calculateIntValue = (def: AleasContentLibraryIntParam): number => {
                
            const {
                name: paramName,
                value,
                link,
                range: [rangeMin, rangeMax] = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
            } = def;

            const clampRange = (val: number) => clamp(val, rangeMin, rangeMax);

            if (paramValues?.ints?.[paramName]) {
                return clampRange(paramValues.ints[paramName]);
            }

            if (value) {
                return clampRange(value);
            }

            if (link) {

                const {
                    to,
                    offset
                } = link;

                const linkedValue = calculatedValues.ints?.[to];
                if (linkedValue) {

                    if (offset) {
                        const offsetVal = getValue(offset);
                        return clampRange(linkedValue + offsetVal);
                    }
                    else {
                        return clampRange(linkedValue);
                    }
                }
                else {
                    throw `Impossible to find linked value for '${paramName}': '${to}'`;
                }
            }

            return randomInt(rangeMin, rangeMax);
        }

        const getValueForInt = (def: AleasContentLibraryIntParam): number => {
            const val = calculateIntValue(def);

            if (!calculatedValues.ints) {
                calculatedValues.ints = {};
            }

            calculatedValues.ints[def.name] = val;

            return val;
        };


        const calculateStringValue = (def: AleasContentLibraryStringParam): string => {
                
            const {
                name: paramName,
                value,
                link,
            } = def;

            if (paramValues?.strings?.[paramName]) {
                return paramValues.strings[paramName];
            }

            if (value) {
                return value;
            }

            if (link) {
                const {
                    to
                } = link;

                const linkedValue = calculatedValues.strings?.[to];
                if (linkedValue) {
                    return linkedValue;
                }
                else {
                    throw `Impossible to find linked value for '${paramName}': '${to}'`;
                }
            }
            
            throw `Can't find a way to find value for '${paramName}'`;
        }

        const getValueForString = (def: AleasContentLibraryStringParam): string => {

            const result = calculateStringValue(def);

            if (!calculatedValues.strings) {
                calculatedValues.strings = {};
            }

            calculatedValues.strings[def.name] = result;

            return result;
        };


        const calculateBoolValue = (def: AleasContentLibraryBoolParam): boolean => {
                
            const {
                name: paramName,
                value,
                link,
            } = def;

            if (paramValues?.bools?.[paramName]) {
                return paramValues.bools[paramName];
            }

            if (value) {
                return value;
            }
            
            if (link) {
                const {
                    to
                } = link;

                const linkedValue = calculatedValues.bools?.[to];
                if (linkedValue) {
                    return linkedValue;
                }
                else {
                    throw `Impossible to find linked value for '${paramName}': '${to}'`;
                }
            }

            return randomBool();
        }

        const getValueForBool = (def: AleasContentLibraryBoolParam): boolean => {

            const val = calculateBoolValue(def);

            if (!calculatedValues.bools) {
                calculatedValues.bools = {};
            }

            calculatedValues.bools[def.name] = val;

            return val;
        }


        const calculateColorValue = (def: AleasContentLibraryColorParam): RgbColor => {

            const {
                name: paramName,
                value,
                link,
            } = def;

            if (paramValues?.colors?.[paramName]) {
                return paramValues.colors[paramName];
            }

            if (value) {
                return value;
            }

            if (link) {
                const {
                    to,
                    hueRotation = 0,
                    saturationOffset = 0,
                    valueOffset = 0
                } = link;


                const linkedValue = calculatedValues.colors?.[to];
                if (linkedValue) {

                    const oldHsv = Color.rgbToHsv(linkedValue);

                    const h = (oldHsv.h + (Array.isArray(hueRotation) ? randomElement(hueRotation) : hueRotation)) % 1.0;
                    const s = (oldHsv.s + getValue(saturationOffset)) % 1;
                    const v = (oldHsv.v + getValue(valueOffset) * 1.0) % 1.0;

                    const rgb = Color.hsvToRgb(Color.hsv(h, s, v));
                    return rgb;
                }
                else {
                    throw `Impossible to find linked value for '${paramName}': '${to}'`;
                }
            }

            const {
                valueRange: [minValue, maxValue] = [0, 1],
                saturationRange: [minSaturation, maxSaturation] = [0, 1]
            } = def;

            const h = random01();
            const s = randomRange(minSaturation, maxSaturation);
            const v = randomRange(minValue, maxValue);

            const rgb = Color.hsvToRgb(Color.hsv(h, s, v));
            return rgb;
        }

        const getValueForColor = (def: AleasContentLibraryColorParam): RgbColor => {
            
            const val = calculateColorValue(def);

            if (!calculatedValues.colors) {
                calculatedValues.colors = {};
            }

            calculatedValues.colors[def.name] = val;

            return val;
        }

        params = paramDefs.map(def => {

            const {
                name: paramName,
                description,
                mapAsglobal,
                type,
            } = def;

            if (type === "float") {
                const value = getValueForFloat(def);
                return {
                    name: paramName,
                    description,
                    mapAsglobal,
                    type,
                    value
                }
            }
            else if (type === "int") {
                const value = getValueForInt(def);
                return {
                    name: paramName,
                    description,
                    mapAsglobal,
                    type,
                    value
                }
            }
            else if (type === "string") {
                const value = getValueForString(def);
                return {
                    name: paramName,
                    description,
                    mapAsglobal,
                    type,
                    value
                }
            }
            else if (type === "bool") {
                const value = getValueForBool(def);
                return {
                    name: paramName,
                    description,
                    mapAsglobal,
                    type,
                    value
                }
            }
            else if (type === "color") {
                const value = getValueForColor(def);
                return {
                    name: paramName,
                    description,
                    type,
                    value
                }
            }
            else {
                throw new Error("Unknown type");
            }
        });
    }
    else {
        params = undefined;
    }
    
    let steps: ContentStepElement[]|undefined;
    if (stepDefs && stepDefs.length > 0) {
        
        if (!stepsKeyFrames) {
            throw new Error(`Missing stepsKeyFrames in scene '${scene}'`);
        }

        if (stepDefs.length !== stepsKeyFrames.length) {
            throw new Error(`Mismatch between steps and stepsKeyFrames in scene '${scene}'`);
        }

        steps = stepDefs.map((def, index) => {
            const {
                name,
                elements,
                description,
            } = def;

            const value = structuredClone(stepsKeyFrames[index]);

            return {
                name,
                elements,
                description,
                value
            }
        })
    }
    else {
        steps = undefined;
    }

    let values: ContentValueElement[]|undefined = undefined;
    if (valueDefs && valueDefs.length > 0) {

        if (!valuesKeyFrames) {
            throw new Error(`Missing valuesKeyFrames in scene '${scene}'`);
        }

        values = valueDefs.map(def=> {
            const {
                name,
                description,
                mapAsGlobal,
                type,
            } = def;

            const record = valuesKeyFrames[name];
            if (!record) {
                throw new Error(`Missing keyframes for value '${name}'`);
            }

            if (type === "float") {

                const {
                    frames,
                    type: recordType
                } = record;

                if (recordType !== "float") {
                    throw new Error("Mismatch between value type and keyframes type");
                }

                return {
                    name,
                    description,
                    mapAsGlobal,
                    type,
                    value: structuredClone(frames)
                }
            }
            else if (type === "color") {

                const {
                    frames,
                    type: recordType
                } = record;

                if (recordType !== "color") {
                    throw new Error("Mismatch between value type and keyframes type");
                }

                return {
                    name,
                    description,
                    mapAsGlobal,
                    type,
                    value: structuredClone(frames)
                }
            }
            else {
                const {
                    frames,
                    type: recordType
                } = record;

                if (recordType !== "string") {
                    throw new Error("Mismatch between value type and keyframes type");
                }

                return {
                    name,
                    description,
                    mapAsGlobal,
                    type,
                    value: structuredClone(frames)
                }
            }
            
        });
    }

    return {
        scene: {
            name: sceneName,
            projectIndex,
        },
        fades,
        params,
        steps,
        values
    }
}


export type GenerateComparableStepsKeyFramesArgs = {
    steps: number;
    totalDuration: number;
    fade: RangeOrValue;
    stepDuration: Range;
    amplitude?: number;
    mode?: "Random"|"Sequential";
    startStepIndex?: number;
    addInitialFade?: boolean;
    addFinalFade?: boolean;
}

export function generateComparableStepsKeyFrames(args: GenerateComparableStepsKeyFramesArgs): KeyFrame[][] {
    
    const {
        steps,
        totalDuration,
        fade,
        stepDuration: [minStepDuration, maxStepDuration],
        amplitude = 1.0,
        mode = "Random",
        startStepIndex,
        addInitialFade = false,
        addFinalFade = false
    } = args;

    if (steps < 2) {
        throw new Error("At least 2 steps are required");
    }

    const result: KeyFrame[][] = sequence(steps).map(() => []);

    const durations: number[] = generateRandomDurations({
        totalDuration,
        range: [minStepDuration, maxStepDuration]
    })

    let currentStep = startStepIndex ?? randomInt(0, steps - 1);

    for (let i = 0; i < steps; i++) {

        if (i !== currentStep) {
            result[i].push([0.0, 0.0]);
        }
        else {

            if (addInitialFade) {
                result[i].push([0.0, 0.0]);
                result[i].push([getValue(fade), amplitude]);
            }
            else {
                result[i].push([0.0, amplitude]);
            }
        }
    }

    let time = 0.0;
    
    for (let i = 0; i < durations.length - 1; i++) {
        const duration = durations[i];

        time += duration;
        const crossFade = getValue(fade);

        result[currentStep].push([time, amplitude]);
        result[currentStep].push([time + crossFade, 0.0]);

        if (mode === "Random") {
            currentStep = (currentStep + randomInt(1, steps)) % steps;
        }
        else {
            currentStep = (currentStep + 1) % steps;
        }

        result[currentStep].push([time, 0.0]);
        result[currentStep].push([time + crossFade, amplitude]);
    }

    for (let i = 0; i < steps; i++) {
        if (i !== currentStep) {
            result[i].push([totalDuration, 0.0]);
        }
        else {
            if (addFinalFade) {
                result[i].push([totalDuration - getValue(fade), amplitude]);
                result[i].push([totalDuration, 0.0]);
            }
            else {
                result[i].push([totalDuration, amplitude]);
            }
        }
    }

    return result;
}

export function getStepCount(library: LoadedLibrary<AleasContentScene>, scene: string) {
    const sceneContent = library[scene];
    const {
        steps
    } = sceneContent;

    if (!steps) {
        throw new Error(`No steps found on scene ${scene}`);
    }

    return steps.length;
}


export type generateInitialStepArgs = {
    totalDuration: number;
    initialStepDuration: number;
    fade: RangeOrValue;
    hasInitialFade?: boolean;
    hasFinalFade?: boolean;
}

export function generateInitialStep(args: generateInitialStepArgs): KeyFrame[][] {
    
    const {
        totalDuration,
        initialStepDuration,
        fade,
        hasInitialFade = true,
        hasFinalFade = true
    } = args;
    
    const crossFade = getValue(fade);
    const pivot = initialStepDuration - crossFade;

    const step1: KeyFrame[] = [];

    if (hasInitialFade) {
        const initialFade = getValue(fade);

        step1.push([0.0, 0.0]);
        step1.push([initialFade, 1.0]);
    }
    else {
        step1.push([0.0, 1.0]);
    }

    step1.push([pivot, 1.0]);
    step1.push([pivot + crossFade, 0.0]);

    const step2: KeyFrame[] = [];

    step2.push([0.0, 0.0]);
    step2.push([pivot, 0.0]);
    step2.push([pivot + crossFade, 1.0]);

    if (hasFinalFade) {
        const finalFade = getValue(fade);

        step2.push([totalDuration - finalFade, 1.0]);
        step2.push([totalDuration, 0.0]);
    }
    else {
        step2.push([totalDuration, 1.0]);
    }

    return [
        step1,
        step2
    ];
}

export type GenerateIntroKeyFramesArgs = {
    duration: number;
    steps: number;
    fade: RangeOrValue;
    startOffset: number;
    speechDuration: number;
    phase1Range: Range;
    phase2Range: Range;
}

export function generateIntroKeyFrames(args: GenerateIntroKeyFramesArgs): KeyFrame[][] {

    const {
        duration: totalDuration,
        steps,
        fade: fadeRov,
        startOffset,
        speechDuration,
        phase1Range,
        phase2Range
    } = args;

    const fade = getValue(fadeRov);
    const keyFrames: KeyFrame[][] = sequence(steps).map(() => []);

    let time = startOffset;

    for (let i = 0; i < steps; i++) {
        keyFrames[i].push([0.0, 0.0]);
    }

    let currentStep = randomInt(0, steps - 1);

    while (time < totalDuration) {

        const [minStepDuration, maxStepDuration] = time < startOffset + speechDuration ? phase1Range : phase2Range;

        currentStep = (currentStep + randomInt(1, steps)) % steps;
        const track = keyFrames[currentStep];

        track.push([time - fade, 0.0]);
        track.push([time, 1.0]);

        const stepDuration = totalDuration - time >= maxStepDuration ?
        randomRange(minStepDuration, maxStepDuration) :
        totalDuration - time;

        track.push([time + stepDuration - fade, 1.0]);
        track.push([time + stepDuration, 0.0]);

        time += stepDuration;
    }

    for (let i = 0; i < steps; i++) {
        if (i !== currentStep) {
            keyFrames[i].push([totalDuration, 0.0]);
        }
    }


    return keyFrames;
}

export type GenerateOutroKeyFramesArgs = {
    duration: number;
    steps: number;
    fade: RangeOrValue;
    startOffset: number;
    endOffset: number;
    salutsRange: Range;
}

export function generateOutroKeyFrames(args: GenerateOutroKeyFramesArgs): KeyFrame[][] {

    const {
        duration: totalDuration,
        steps,
        fade: fadeRov,
        startOffset,
        endOffset,
        salutsRange
    } = args;

    const fade = getValue(fadeRov);

    const keyFrames: KeyFrame[][] = sequence(steps).map(() => []);

    for (let i = 0; i < steps; i++) {
        keyFrames[i].push([0.0, 0.0]);
    }

    let time = startOffset;
    let currentStep = randomInt(0, steps - 1);

    while (time < totalDuration - endOffset) {

        const [minStepDuration, maxStepDuration] = salutsRange;

        currentStep = (currentStep + randomInt(1, steps)) % steps;
        const track = keyFrames[currentStep];

        track.push([time - fade, 0.0]);
        track.push([time, 1.0]);

        const stepDuration = (totalDuration - endOffset) - time >= maxStepDuration ?
        randomRange(minStepDuration, maxStepDuration) :
        (totalDuration - endOffset) - time;

        track.push([time + stepDuration - fade, 1.0]);
        track.push([time + stepDuration, 0.0]);

        time += stepDuration;
    }

    for (let i = 0; i < steps; i++) {
        keyFrames[i].push([totalDuration, 0.0]);
    }

    return keyFrames;
}

export type CalculateWeightArgs = {
    base: number;
    slope?: number;
    penalty?: number;

    min?: number;
    max?: number;
}

export function calculateWeight(args: CalculateWeightArgs): (cpva: CalculateParamValArgs) => number {

    return (cpva: CalculateParamValArgs) => {
        const {
            occurences,
            progress
        } = cpva;
        
        const {
            base,
            slope,
            penalty,
            min = 0,
            max
        } = args;

        let result = base;

        if (slope) {
            result += slope * progress;
        }

        if (penalty) {
            result -= penalty * occurences;
        }

        if (max) {
            result = Math.min(max, result);
        }

        result = Math.max(min, result);

        return result;
    }
}

export type CalculateEnabledArgs = {
    minProgress?: number;
    maxProgress?: number;
    maxOccurences?: number;
}

export function calculateEnabled(args: CalculateEnabledArgs): (cpva: CalculateParamValArgs) => boolean {
        return (cpva: CalculateParamValArgs) => {
        const {
            occurences,
            progress
        } = cpva;

        const {
            minProgress,
            maxProgress,
            maxOccurences
        } = args;
        
        if (minProgress && progress < minProgress) {
            return false;
        }

        if (maxProgress && progress > maxProgress) {
            return false;
        }

        if (maxOccurences && occurences >= maxOccurences) {
            return false;
        }
        
        return true;
    }
}

export type ChunkifyTextArgs = {
    text: string;
    maxChunkCount?: number;
} & ({
    chunkType: "Random";
    chunkSize: Range;
} | {
    chunkType: "Fixed";
    chunkSize: number;
})

export function chunkifyText(args: ChunkifyTextArgs): string[] {

    const {
        text,
        chunkType,
        maxChunkCount = Number.MAX_SAFE_INTEGER
    } = args;

    const words = text.split(" ");

    let wi = 0;
    let ci = 0;
    let result = [];

    while (wi < words.length && ci < maxChunkCount) {
        let chunkSize: number;

        if (chunkType === "Random") {
            chunkSize = randomInt(args.chunkSize[0], args.chunkSize[1]);
        }
        else {
            chunkSize = args.chunkSize;
        }

        const chunk = words.slice(wi, wi + chunkSize).join(" ");
        result.push(chunk);

        wi += chunkSize;
        ci++;

    }

    return result;
}