import { random01, randomBool, randomElement, randomRange } from "../../core/utils";
import { CalculateParamValArgs, LoadedLibraries, StartAndDuration, Range, makeSceneProvider, AleasSceneTemplate, SceneBaseInfo, AudioElementsOrNoAudio, KeyFrame, SceneData, GenerateAleasShowArgs, ContentElementOrNoContent, ContentElement, AudioElement } from "../aleas-generation";
import { calculateEnabled, calculateWeight, chunkifyText, createStandardLevel, generateAudioElements, generateComparableStepsKeyFrames, generateContentElement, generateInitialStep, generateIntermittentIntervals, generateIntroKeyFrames, generateOutroKeyFrames, getFade, getRandomDuration, getRandomElementFromAudioLib, getRandomMonologue, getRandomProjectionInput, getRandomSceneFromScenes, getStepCount, getValue, getWholeRangeAmplitude, keyFramesFromIntervals, ScenesGroup, VKFRecord, VKFRecordElement } from "../aleas-generation-utils";

export const repetition = {
    templates: {
        "monologue": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "monologue";
            const templateInfo = "Monologue";

            const {
                projectionDuration,
                chunkDuration,
                chunkSize,
                audioAmplitude
            } = repetition.variables.monologue;

            const availableDurations = [
                repetition.durations.monologue
            ];

            const audioLibs = [
                repetition.audioLibs.instru
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                repetition.sceneContent.monologue
            ];


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const [fadeMin, fadeMax] = repetition.fades.audioStandard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);

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

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fade = repetition.fades.standardShort;

                const scene = getRandomSceneFromScenes(availableScenes);

                const chunkDurVal = randomRange(chunkDuration[0], chunkDuration[1]);
                const chunkCount = Math.round(randomRange(projectionDuration[0], projectionDuration[1]) / chunkDurVal);

                const step1Duration = chunkCount * chunkDurVal;
                const stepsKeyFrames: KeyFrame[][] = generateInitialStep({
                    totalDuration: duration,
                    initialStepDuration: step1Duration,
                    fade: repetition.fades.short,
                })

                const { text } = getRandomMonologue(libraries.monologueLibraries)

                const chunks = chunkifyText({
                    text,
                    maxChunkCount: chunkCount,
                    chunkType: "Random",
                    chunkSize: chunkSize,
                })

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn: fade,
                    fadeOut: fade,
                    stepsKeyFrames,
                    valuesKeyFrames: {
                        "text": {
                            type: "string",
                            frames: chunks
                                .map((str, i) => {
                                    return [
                                        i * chunkDurVal,
                                        str
                                    ]
                                })
                        }
                    }
                })

                return {
                    hasContent: true,
                    content
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: true,
                weight: calculateWeight({
                    base: 10,
                    slope: 90,
                }),
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },

    } satisfies { [key: string]: (libraries: LoadedLibraries) => AleasSceneTemplate },
    tags: {

    },
    sceneContent: {
        intro: "intro",
        outro: "outro",
        monologue: [
            "monologue",
        ]
    },
    variables: {
        monologue: {
            chunkSize: [3, 8] satisfies Range,
            chunkDuration: [1.9, 3.9] satisfies Range,
            projectionDuration: [25, 55] satisfies Range,
            audioAmplitude: 0.48,
        },
        intro: {
            lightsOffset: 7.5,
            speechDuration: 22.5,
            phase1Range: [0.9, 5.2] satisfies Range,
            phase2Range: [4.5, 9.1] satisfies Range,
            fade: 0.2,
        },
        outro: {
            lightsOffset: 7.5,
            range: [1.5, 8] satisfies Range,
            lightsFade: 0.4,
            interBlackout: 1.5,
        },
    },
    fades: {
        ultraShort: [0.2, 0.5],
        short: [0.7, 1.3],
        standardShort: [1.2, 3],
        standard: [1.5, 4.5],
        standardLong: [3, 6],
        long: [5, 9],
        audioUltraShort: [0.2, 1],
        audioShort: [1, 2.5],
        audioStandard: [2, 4],
    } satisfies { [key: string]: Range },
    durations: {
        ultraShort: [4, 8],
        short: [30, 70],
        specialAmbiances: [45, 90],
        monologue: [55, 150],
        mediumShort: [50, 110],
        standard: [80, 220],
        standardLong: [160, 350],
        long: [240, 480],
    } satisfies { [key: string]: Range },
    audioLibs: {
        general: "aleas-general",
        loud: "aleas-loud",
        ambient: "aleas-ambient",
        standalone: "aleas-standalone",
        wtf: "aleas-wtf",
        instru: "aleas-instru",
        text: "aleas-text",
        billetreduc: "aleas-billetreduc",
        voices: "voices",
    } satisfies { [key: string]: string },
}


export function getRepetitionSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {

    const factories: ((libraries: LoadedLibraries) => AleasSceneTemplate)[] = Object.values(repetition.templates);

    const templates = factories.map(factory => factory(libraries));

    return templates;
};


export function generateRepetitionIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const audioFade = repetition.fades.audioUltraShort;
    const audioFadeIn = getValue(audioFade);
    const audioFadeOut = getValue(audioFade);

    const {
        intro: {
            duration: durationRov,
            volume
        }
    } = args;

    const {
        fade: lightFade,
        lightsOffset,
        speechDuration,
        phase1Range,
        phase2Range,
    } = repetition.variables.intro;

    const duration = getValue(durationRov);

    const audio: AudioElement[] = [
        {
            track: "intro-01",
            startTime: 0,
            duration,
            amplitude: volume,
            volume: createStandardLevel({
                duration,
                fadeIn: audioFadeIn,
                fadeOut: audioFadeOut,
            })
        }
    ]

    const stepsKeyFrames: KeyFrame[][] = generateIntroKeyFrames({
        duration,
        steps: 4,
        fade: lightFade,
        startOffset: lightsOffset,
        speechDuration: speechDuration,
        phase1Range,
        phase2Range
    });

    const content: ContentElement = generateContentElement(libraries.contentLibraries, {
        scene: repetition.sceneContent.intro,
        duration,
        fadeIn: lightFade,
        fadeOut: lightFade,
        stepsKeyFrames
    });

    return {
        templateName: "intro",
        duration,
        blackout: {
            preScene: 4.0,
            postScene: 4.0
        },
        info: "Intro scene",
        hasAudio: true,
        audio,
        hasContent: true,
        content,
    }
}

export function generateRepetitionOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const audioFade = repetition.fades.audioUltraShort;
    const audioFadeIn = getValue(audioFade);
    const audioFadeOut = getValue(audioFade);

    const {
        outro: {
            duration: durationRov,
            volume,
            depresentationVolume
        }
    } = args;

    const {
        lightsFade,
        lightsOffset,
        interBlackout,
        range: salutsRange
    } = repetition.variables.outro;

    const duration = getValue(durationRov);

    const audio: AudioElement[] = [
        {
            track: "intro-01",
            startTime: 0,
            duration,
            amplitude: 1,
            volume: [
                [0, 0],
                [audioFadeIn, volume],
                [duration - audioFadeOut, volume],
                [duration, depresentationVolume]
            ],
            continueAfterSceneEnd: true
        }
    ]

    const stepsKeyFrames: KeyFrame[][] = generateOutroKeyFrames({
        duration,
        steps: 4,
        fade: lightsFade,
        startOffset: lightsOffset,
        endOffset: interBlackout,
        salutsRange
    });

    const content: ContentElement = generateContentElement(libraries.contentLibraries, {
        scene: repetition.sceneContent.outro,
        duration,
        fadeIn: lightsFade,
        fadeOut: lightsFade,
        stepsKeyFrames
    });

    return {
        templateName: "outro",
        duration,
        blackout: {
            preScene: 4.0,
            postScene: 4.0
        },
        info: "Outro scene",
        hasAudio: true,
        audio,
        hasContent: true,
        content,
    }
}