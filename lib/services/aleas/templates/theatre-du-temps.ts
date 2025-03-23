import { notImplemented, random01, randomElement, randomInt, randomRange, sequence } from "../../core/utils";
import { CalculateParamValArgs, LoadedLibraries, StartAndDuration, Range, makeSceneProvider, AleasSceneTemplate, SceneBaseInfo, AudioElementsOrNoAudio, KeyFrame, SceneData, GenerateAleasShowArgs, ContentElementOrNoContent, ContentElement, AudioElement, PreSceneElementOrNoPreScene } from "../aleas-generation";
import { calculateEnabled, calculateWeight, chunkifyText, createStandardLevel, generateAudioElements, generateComparableStepsKeyFrames, generateContentElement, generateInitialStep, generateIntermittentIntervals, generateIntroKeyFrames, generateOutroKeyFrames, generatePeriodicEvent, generateRandomDurations, getFade, getRandomDuration, getRandomElementFromAudioLib, getRandomMonologue, getRandomProjectionInput, getRandomSceneFromScenes, getStepCount, getValue, getWholeRangeAmplitude, keyFramesFromIntervals, randomVoiceIndex, ScenesGroup } from "../aleas-generation-utils";

export const theatreDuTemps = {
    templates: {
        "simple-standard-duration": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "simple-standard-duration";
            const templateInfo = "Simple scene with basic lights and standard duration";

            const availableDurations = [
                theatreDuTemps.durations.short,
                theatreDuTemps.durations.standard,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.standard
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fadeIn = randomRange(1, 6);
                const fadeOut = randomRange(1, 6);

                const scene = getRandomSceneFromScenes(availableScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: (args) => {
                    return args.currentScene > 1
                },
                weight: 8,
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                }, libraries),
                durationRange
            }
        },
        "simple-with-music": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "simple-with-music";
            const templateInfo = "Simple scene with basic lights, standard duration and music";

            const audioLibraries = [
                theatreDuTemps.audioLibs.general,
            ]

            const availableDurations = [
                theatreDuTemps.durations.standard,
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.standard,
            ];

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fadeIn = randomRange(1, 6);
                const fadeOut = randomRange(1, 6);

                const scene = getRandomSceneFromScenes(availableScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
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
                    audioLibraries
                });

                return {
                    hasAudio: true,
                    audio
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: (args) => {
                    return args.currentScene > 1
                },
                weight: 9,
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "ambient": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "ambient";
            const templateInfo = "Ambient scene";

            const availableDurations = [
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
                theatreDuTemps.durations.long,
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                theatreDuTemps.sceneContent.ambient,
            ];

            const audioProbability = theatreDuTemps.variables.ambient.audioProbability;
            const audioLibs = [
                theatreDuTemps.audioLibs.ambient,
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(ambientScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                if (Math.random() < audioProbability) {

                    const fadeIn = randomRange(2, 5);
                    const fadeOut = randomRange(2, 4);
                    const audioAmplitude = theatreDuTemps.variables.ambient.audioAmplitude;

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
                else {
                    return {
                        hasAudio: false
                    }
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: true,
                weight: calculateWeight({
                    penalty: 5,
                    base: 18,
                    slope: 10
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "ambient-swap": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "ambient-swap";
            const templateInfo = "Ambient scene with color swap";

            const availableDurations = [
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
                theatreDuTemps.durations.long,
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                theatreDuTemps.sceneContent.ambientSwap,
            ];

            const audioProbability = theatreDuTemps.variables.ambientSwap.audioProbability;
            const audioLibs = [
                theatreDuTemps.audioLibs.ambient,
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(ambientScenes);
                const steps = getStepCount(libraries.contentLibraries, scene);

                const stepsKeyFrames: KeyFrame[][] = generateComparableStepsKeyFrames({
                    steps: steps,
                    totalDuration: duration,
                    fade: [fadeMin, fadeMax],
                    stepDuration: theatreDuTemps.variables.ambientSwap.stepDuration,
                    addFinalFade: false,
                    addInitialFade: false,
                });

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                    stepsKeyFrames
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                if (Math.random() < audioProbability) {
                    const fadeIn = randomRange(2, 5);
                    const fadeOut = randomRange(2, 4);
                    const audioAmplitude = theatreDuTemps.variables.ambient.audioAmplitude;

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
                else {
                    return {
                        hasAudio: false
                    }
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: calculateEnabled({
                    minProgress: 0.25,
                    maxOccurences: 2
                }),
                weight: calculateWeight({
                    penalty: 25,
                    base: 15,
                    slope: 32
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "ultra-short": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "ultra-short";
            const templateInfo = "Ultra short scene";

            const availableDurations = [
                theatreDuTemps.durations.ultraShort
            ];

            const availableFades: Range[] = [
                theatreDuTemps.fades.ultraShort
            ]

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.standard,
                theatreDuTemps.sceneContent.ambient,
                theatreDuTemps.sceneContent.isolations
            ];


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fadeIn = getFade(...availableFades);
                const fadeOut = getFade(...availableFades);

                const scene = getRandomSceneFromScenes(availableScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: calculateEnabled({
                    maxOccurences: 3,
                    minProgress: 0.1,
                    maxProgress: 0.9
                }),
                weight: calculateWeight({
                    penalty: 20,
                    base: 12,
                    slope: 45
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                }, libraries),
                durationRange
            }
        },
        "isolation": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "isolation";
            const templateInfo = "Isolation scene";

            const availableDurations = [
                theatreDuTemps.durations.short,
                theatreDuTemps.durations.standard,
            ];

            const availableFades: Range[] = [
                theatreDuTemps.fades.short,
                theatreDuTemps.fades.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.isolations
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const audioLibs = [
                theatreDuTemps.audioLibs.general,
            ];

            const audioProbability = theatreDuTemps.variables.isolations.audioProbability;

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fadeIn = getFade(...availableFades);
                const fadeOut = getFade(...availableFades);

                const scene = getRandomSceneFromScenes(availableScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                if (Math.random() < audioProbability) {

                    const fadeIn = randomRange(2, 5);
                    const fadeOut = randomRange(2, 4);
                    const audioAmplitude = theatreDuTemps.variables.isolations.audioAmplitude;

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
                else {
                    return {
                        hasAudio: false
                    }
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: true,
                weight: (args) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 7;

                    const base = 15;
                    const slope = 18;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio,
                }, libraries),
                durationRange
            }
        },
        "isolations-alternate": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "isolations-alternate";
            const templateInfo = "Isolation scene - Alternate";

            const availableDurations = [
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
            ];

            const availableFades: Range[] = [
                theatreDuTemps.fades.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.isolationsAlternates
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fadeIn = getFade(...availableFades);
                const fadeOut = getFade(...availableFades);
                const crossFade = getFade(...availableFades);

                const scene = getRandomSceneFromScenes(availableScenes);
                const steps = getStepCount(libraries.contentLibraries, scene);

                const stepsKeyFrames: KeyFrame[][] = generateComparableStepsKeyFrames({
                    steps: steps,
                    totalDuration: duration,
                    fade: crossFade,
                    stepDuration: theatreDuTemps.variables.isolationsAlternate.stepDuration,
                    addFinalFade: false,
                    addInitialFade: false,
                });

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                    stepsKeyFrames
                })

                return {
                    hasContent: true,
                    content
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: (args) => args.progress > 0.1,
                weight: (args) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 20;

                    const base = 4;
                    const slope = 40;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    )
                },
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                }, libraries),
                durationRange
            }
        },
        "white-rotation": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "white-rotation";
            const templateInfo = "Special scene with rotating white light";

            const availableDurations = [
                theatreDuTemps.durations.specialAmbiances
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const wrScenes = [
                theatreDuTemps.sceneContent.whiteRotation,
            ];

            const audioLibs = [
                theatreDuTemps.audioLibs.intense,
            ]

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(wrScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.audioStandard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                const audioAmplitude = theatreDuTemps.variables.whiteRotation.audioAmplitude;

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
                enabled: (args) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    return progress > 0.45 && occurences < 1;
                },
                weight: (args) => {
                    const {
                        progress
                    } = args;

                    const base = 60;
                    const slope = 40;

                    return base + progress * slope;
                },
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "color-wave": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "color-wave";
            const templateInfo = "Color Wave";

            const availableDurations = [
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const colorWaveScenes = [
                theatreDuTemps.sceneContent.colorWave,
            ];

            const audioProbability = theatreDuTemps.variables.colorWave.audioProbability;
            const audioAmplitude = theatreDuTemps.variables.colorWave.audioAmplitude;
            const audioDuration = theatreDuTemps.variables.colorWave.audioDuration;
            const audioLibraries = [
                theatreDuTemps.audioLibs.general,
                theatreDuTemps.audioLibs.instru
            ]

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(colorWaveScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                if (Math.random() < audioProbability) {

                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: audioDuration,
                        fadeDurationRange: theatreDuTemps.fades.audioStandard,
                        amplitude: audioAmplitude,
                        startEndMargin: 10,
                        minSpaceBetweenAudio: 40,
                        audioLibraries,
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
                enabled: (args) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    return progress > 0.3 && occurences < 2;
                },
                weight: calculateWeight({
                   base: 40,
                   slope: 40,
                   penalty: 30 
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "mapping-geometric": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "mapping-geometric";
            const templateInfo = "Mapping Geometric";

            const availableDurations = [
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const mappingScenes: ScenesGroup = [
                theatreDuTemps.sceneContent.mappingGeometric,
            ];

            const variables = theatreDuTemps.variables.mappingGeometric;
            const audioProbability = variables.audioProbability;
            const audioAmplitude = variables.audioAmplitude;
            const audioDuration = variables.audioDuration;
            
            const audioLibraries = [
                theatreDuTemps.audioLibs.general,
                theatreDuTemps.audioLibs.instru
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(mappingScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    hasShutter: true,
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                if (Math.random() < audioProbability) {

                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: audioDuration,
                        fadeDurationRange: theatreDuTemps.fades.audioStandard,
                        amplitude: audioAmplitude,
                        startEndMargin: 10,
                        minSpaceBetweenAudio: 40,
                        audioLibraries
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
                enabled:calculateEnabled({
                    minProgress: 0.25
                }),
                weight: calculateWeight({
                    base: 45,
                    slope: 45,
                    penalty: 20
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "mapping-geometric-moving": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "mapping-geometric-moving";
            const templateInfo = "Mapping Geometric Moving";

            const availableDurations = [
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const mappingScenes: ScenesGroup = [
                theatreDuTemps.sceneContent.mappingGeometricMoving,
            ];

            const variables = theatreDuTemps.variables.mappingGeometricMoving;
            const {
                audioStandardProbability,
                audioStandardAmplitude,
                audioStandardDuration,
                audioAmbientProbability,
                audioAmbientAmplitude,
            } = variables;
            
            const audioStandardLibraries = [
                theatreDuTemps.audioLibs.general,
                theatreDuTemps.audioLibs.instru
            ]

            const audioAmbientLibraries = [
                theatreDuTemps.audioLibs.ambient,
            ]

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(mappingScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    hasShutter: true,
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const result = random01();

                if (result < audioStandardProbability) {

                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: audioStandardDuration,
                        fadeDurationRange: theatreDuTemps.fades.audioStandard,
                        amplitude: audioStandardAmplitude,
                        startEndMargin: 10,
                        minSpaceBetweenAudio: 40,
                        audioLibraries: audioStandardLibraries
                    });

                    return {
                        hasAudio: true,
                        audio
                    }
                }
                else if (result < audioStandardProbability + audioAmbientProbability) {
                        
                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: audioStandardDuration,
                        fadeDurationRange: theatreDuTemps.fades.audioStandard,
                        amplitude: audioAmbientAmplitude,
                        startEndMargin: 10,
                        minSpaceBetweenAudio: 40,
                        audioLibraries: audioAmbientLibraries
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
                enabled: calculateEnabled({
                    minProgress: 0.25
                }),
                weight: calculateWeight({
                    base: 30,
                    slope: 30,
                    penalty: 20
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "mapping-wallpaper": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "mapping-wallpaper";
            const templateInfo = "Mapping Wallpaper";

            const availableDurations = [
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const mappingScenes: ScenesGroup = [
                theatreDuTemps.sceneContent.mappingWallPaper,
            ];

            const variables = theatreDuTemps.variables.mappingWallpaper;
            const {
                audioStandardProbability,
                audioStandardAmplitude,
                audioStandardDuration,
                audioAmbientProbability,
                audioAmbientAmplitude,
            } = variables;
            
            const audioStandardLibraries = [
                theatreDuTemps.audioLibs.general,
                theatreDuTemps.audioLibs.instru
            ]

            const audioAmbientLibraries = [
                theatreDuTemps.audioLibs.ambient,
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);

                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(mappingScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    hasShutter: true,
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const result = random01();

                if (result < audioStandardProbability) {

                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: audioStandardDuration,
                        fadeDurationRange: theatreDuTemps.fades.audioStandard,
                        amplitude: audioStandardAmplitude,
                        startEndMargin: 10,
                        minSpaceBetweenAudio: 40,
                        audioLibraries: audioStandardLibraries
                    });

                    return {
                        hasAudio: true,
                        audio
                    }
                }
                else if (result < audioStandardProbability + audioAmbientProbability) {
                        
                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: audioStandardDuration,
                        fadeDurationRange: theatreDuTemps.fades.audioStandard,
                        amplitude: audioAmbientAmplitude,
                        startEndMargin: 10,
                        minSpaceBetweenAudio: 40,
                        audioLibraries: audioAmbientLibraries
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
                enabled: calculateEnabled({
                    minProgress: 0.25,
                }),
                weight: calculateWeight({
                    base: 40,
                    slope: 50,
                    penalty: 15
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio
                }, libraries),
                durationRange
            }
        },
        "confessionnal": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "confessionnal";
            const templateInfo = "Confessionnal";

            const variables = theatreDuTemps.variables.confessionnal;
            const {
                duration,
                thresholds,
            } = variables;

            const durationRange: Range = [duration, duration];

            const scene = theatreDuTemps.sceneContent.confessionnal;

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout: theatreDuTemps.blackouts.confessionnal
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);

                const durationMadmapperMin = 60;
                const durationMadmapperMax = 180;

                const duration01 = (duration - durationMadmapperMin) / (durationMadmapperMax - durationMadmapperMin);

                const content = generateContentElement(libraries.contentLibraries, {
                    hasShutter: true,
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                    paramValues: {
                        floats: {
                            "duration": duration01
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
                isPriority: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    return (progress > thresholds[0] && occurences < 1)
                        || (progress > thresholds[1] && occurences < 2);
                },
                enabled: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        occurences
                    } = args;


                    return occurences < thresholds.length && (
                        (progress > thresholds[0] && occurences < 1) ||
                        (progress > thresholds[1] && occurences < 2)
                    )
                },
                weight: 0,
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                }, libraries),
                durationRange
            }
        },
        "projection-input": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "projection-input";
            const templateInfo = "Projection Input";

            const {
                projectionDuration,
                gapDuration
            } = theatreDuTemps.variables.projInput;

            const availableDurations = [
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.projInput
            ];

            const projectionInput = getRandomProjectionInput(libraries.inputProjectionLibraries);
            const voiceIndex = randomVoiceIndex();


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fade = theatreDuTemps.fades.standardShort;

                const scene = getRandomSceneFromScenes(availableScenes);

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn: fade,
                    fadeOut: fade,
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getPreSceneInfo = (args: CalculateParamValArgs): PreSceneElementOrNoPreScene => {
                const {
                    key,
                    value,
                } = projectionInput;

                const {
                    volume,
                    etMaintenantDuration,                    
                } = theatreDuTemps.variables.voices;

                return {
                    hasPreScene: true,
                    preScene: {
                        duration: projectionDuration,
                        audio: {
                            volume,
                            track: `${key}-${voiceIndex.toString().padStart(2, "0")}`,
                        },
                        gapDuration,
                        text: [
                            [0, "Et maintenant,"],
                            [etMaintenantDuration, value],
                        ]
                    }
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: calculateEnabled({
                    minProgress: 0.3,
                    maxOccurences: 3
                }),
                weight: calculateWeight({
                    base: 120,
                    slope: 30,
                    penalty: 50
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getPreSceneInfo
                }, libraries),
                durationRange
            }
        },
        "bascule-loud": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "bascule-loud";
            const templateInfo = "Scene with loud bascules";

            const {
                audioAmplitude,
                basculeDuration,
                startMargin,
                endMargin,
                minSpaceBetweenEvents,
                occurencesCap,
                fadeAudioOffset
            } = theatreDuTemps.variables.basculeLoud;
            
            const availableDurations = [
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
                theatreDuTemps.durations.long,
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const basculesScenes = [
                theatreDuTemps.sceneContent.basculePF,
            ];

            const basculeAudioLibs = [
                theatreDuTemps.audioLibs.intense,
            ]

            type BasculeMoreArgs = {
                bascules: StartAndDuration[];
                fadeToBascule: number;
                fadeBack: number;
            }

            const getMoreArgs = (args: CalculateParamValArgs, duration: number): BasculeMoreArgs => {
                const bascules: StartAndDuration[] = generateIntermittentIntervals({
                    totalDuration: duration,
                    eventDurationRange: basculeDuration,
                    startMargin,
                    endMargin,
                    minSpaceBetweenEvents,
                    occurencesCap
                });;

                const fadeToBascule = getValue(theatreDuTemps.fades.ultraShort);
                const fadeBack = getValue(theatreDuTemps.fades.standardShort);

                return {
                    bascules,
                    fadeToBascule,
                    fadeBack
                }
            }

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: BasculeMoreArgs): ContentElementOrNoContent => {

                const {
                    bascules,
                    fadeToBascule,
                    fadeBack
                } = moreArgs;
                

                const fadeIn = theatreDuTemps.fades.standard;
                const fadeOut = theatreDuTemps.fades.standard;
                
                const scene = getRandomSceneFromScenes(basculesScenes);

                const stepsKeyFrames: KeyFrame[][] = [
                    keyFramesFromIntervals({
                        intervals: bascules,
                        duration,
                        fadeIn: fadeToBascule,
                        fadeOut: fadeBack,
                        intervalValue: 0,
                        outsideOfIntervalValue: 1
                    }),
                    keyFramesFromIntervals({
                        intervals: bascules,
                        duration,
                        fadeIn: fadeToBascule,
                        fadeOut: fadeBack,
                        intervalValue: 1,
                        outsideOfIntervalValue: 0
                    }),
                ];

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                    stepsKeyFrames
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: BasculeMoreArgs): AudioElementsOrNoAudio => {

                const {
                    bascules,
                    fadeToBascule,
                    fadeBack
                } = moreArgs;

                const audioLib = randomElement(basculeAudioLibs);
                const track = getRandomElementFromAudioLib(libraries.audioLibraries, audioLib);

                const audio = bascules.map(bascule => {
                    const { startTime, duration: eltDuration } = bascule;

                    return {
                        track,
                        startTime: startTime - fadeAudioOffset,
                        duration: eltDuration,
                        amplitude: audioAmplitude,
                        volume: createStandardLevel({
                            duration: eltDuration + 2 * fadeAudioOffset,
                            fadeIn: fadeToBascule,
                            fadeOut: fadeBack,
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
                enabled: calculateEnabled({
                    minProgress: 0.3,
                    maxOccurences: 2
                }),
                weight: calculateWeight({
                    base: 30,
                    slope: 40,
                    penalty: 22
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio,
                    getMoreArgs
                }, libraries),
                durationRange
            }
        },
        "bascule-ambient": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "bascule-ambient";
            const templateInfo = "Bascule Ambient";

            const {
                audioAmbientAmplitude,
                basculeDuration,
                startMargin,
                endMargin,
                minSpaceBetweenEvents,
                occurencesCap,
                fadeAudioOffset
            } = theatreDuTemps.variables.basculeAmbient;
            
            const availableDurations = [
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
                theatreDuTemps.durations.long,
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const basculesScenes = [
                theatreDuTemps.sceneContent.basculeAmbient,
            ];

            const basculeAudioLibs = [
                theatreDuTemps.audioLibs.ambient,
            ]

            type BasculeMoreArgs = {
                bascules: StartAndDuration[];
                fadeToBascule: number;
                fadeBack: number;
            }

            const getMoreArgs = (args: CalculateParamValArgs, duration: number): BasculeMoreArgs => {
                const bascules: StartAndDuration[] = generateIntermittentIntervals({
                    totalDuration: duration,
                    eventDurationRange: basculeDuration,
                    startMargin,
                    endMargin,
                    minSpaceBetweenEvents,
                    occurencesCap
                });;

                const fadeToBascule = getValue(theatreDuTemps.fades.standard);
                const fadeBack = getValue(theatreDuTemps.fades.standard);

                return {
                    bascules,
                    fadeToBascule,
                    fadeBack
                }
            }

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: BasculeMoreArgs): ContentElementOrNoContent => {

                const {
                    bascules,
                    fadeToBascule,
                    fadeBack
                } = moreArgs;
                

                const fadeIn = theatreDuTemps.fades.standard;
                const fadeOut = theatreDuTemps.fades.standard;
                
                const scene = getRandomSceneFromScenes(basculesScenes);

                const stepsKeyFrames: KeyFrame[][] = [
                    keyFramesFromIntervals({
                        intervals: bascules,
                        duration,
                        fadeIn: fadeToBascule,
                        fadeOut: fadeBack,
                        intervalValue: 0,
                        outsideOfIntervalValue: 1
                    }),
                    keyFramesFromIntervals({
                        intervals: bascules,
                        duration,
                        fadeIn: fadeToBascule,
                        fadeOut: fadeBack,
                        intervalValue: 1,
                        outsideOfIntervalValue: 0
                    }),
                ];

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                    stepsKeyFrames
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: BasculeMoreArgs): AudioElementsOrNoAudio => {

                const {
                    bascules,
                    fadeToBascule,
                    fadeBack
                } = moreArgs;

                const audioLib = randomElement(basculeAudioLibs);
                const track = getRandomElementFromAudioLib(libraries.audioLibraries, audioLib);
                
                const audio = [{
                    track,
                    startTime: 0,
                    duration,
                    amplitude: audioAmbientAmplitude,
                    volume: keyFramesFromIntervals({
                        intervals: bascules,
                        duration,
                        fadeIn: fadeToBascule,
                        fadeOut: fadeBack,
                        intervalValue: 0,
                        outsideOfIntervalValue: 1,
                        inIntervalOffset: fadeAudioOffset,
                    })
                }]

                return {
                    hasAudio: true,
                    audio
                }
            }

            return {
                name: templateName,
                isPriority: false,
                enabled: calculateEnabled({
                    minProgress: 0.3,
                    maxOccurences: 2
                }),
                weight: calculateWeight({
                    base: 20,
                    slope: 40,
                    penalty: 20
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio,
                    getMoreArgs
                }, libraries),
                durationRange
            }
        },
        "monologue": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "monologue";
            const templateInfo = "Monologue";

            const {
                projectionDuration,
                chunkDuration,
                chunkSize,
                audioAmplitude,
                preSceneDuration,
                gapDuration
            } = theatreDuTemps.variables.monologue;

            const availableDurations = [
                theatreDuTemps.durations.monologue
            ];

            const availableBlackouts = [
                theatreDuTemps.blackouts.standard
            ]

            const audioLibs = [
                theatreDuTemps.audioLibs.instru
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.monologue
            ];

            const voiceIndex = randomVoiceIndex();

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
                const blackout = getRandomDuration(...availableBlackouts);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo,
                    blackout
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.audioStandard;

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

                const fade = theatreDuTemps.fades.standardShort;

                const scene = getRandomSceneFromScenes(availableScenes);

                const chunkDurVal = randomRange(chunkDuration[0], chunkDuration[1]);
                const chunkCount = Math.round(randomRange(projectionDuration[0], projectionDuration[1]) / chunkDurVal);

                const step1Duration = chunkCount * chunkDurVal;
                const stepsKeyFrames: KeyFrame[][] = generateInitialStep({
                    totalDuration: duration,
                    initialStepDuration: step1Duration,
                    fade: theatreDuTemps.fades.short,
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
                    hasShutter: true,
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
                    },
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getPreSceneInfo = (args: CalculateParamValArgs): PreSceneElementOrNoPreScene => {

                const {
                    volume,
                    etMaintenantDuration,
                } = theatreDuTemps.variables.voices;

                return {
                    hasPreScene: true,
                    preScene: {
                        duration: preSceneDuration,
                        audio: {
                            volume,
                            track: `monologue-${voiceIndex.toString().padStart(2, "0")}`,
                        },
                        gapDuration,
                        text: [
                            [0, "Et maintenant,"],
                            [etMaintenantDuration, "un monologue"],
                        ]
                    }
                }
            }

            return {
                name: templateName,
                enabled: calculateEnabled({
                    minProgress: 0.55,
                    maxOccurences: 2,
                }),
                weight: calculateWeight({
                    base: 180,
                    slope: 90,
                    penalty: 90
                }),
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio,
                    getPreSceneInfo
                }, libraries),
                durationRange
            }
        },
    } satisfies { [key: string]: (libraries: LoadedLibraries) => AleasSceneTemplate },
    tags: {
        preshow: "preshow",
        postshow: "postshow",
        confessionnal: "confessionnal",
        intro: "intro",
        outro: "outro",
        standard: "standard",
        pleinsFeux: "pleins-feux",
        color: "color",
        ambient: "ambient",
        douche: "douche",
        isolation: "isolation",
        decoupe: "decoupe",
        special: "special",
        loud: "loud",
        intense: "intense",
        bascule: "bascule",
        ambientSwap: "ambient-swap",
        strobes: "strobes",
        mapping: "mapping",
        mappingGeometric: "mapping-geometric",
    },
    sceneContent: {
        preshow: "preshow",
        postshow: "postshow",
        intro: "intro",
        outro: "outro",
        confessionnal: "confessionnal",
        standard: [
            "pf-chaud",
            "pf-froid",
        ],
        ambient: [
            "full-color",
            "bicolor",
            //"tricolor",
        ],
        isolations: [
            "douche-jar",
            "douche-cour",
            "double-douches",
            "decoupe-centrale",
        ],
        isolationsAlternates: [
            "douches-alternate"
        ],
        ambientSwap: [
            "col-swap-2",
            "col-swap-3",
        ],
        basculePF: [
            "pf-ch-basc-col",
            "pf-fr-basc-col",
            "pf-ch-basc-str",
        ],
        basculeAmbient: [
            "col-basc-decoupe",
        ],
        projInput: [
            "pf-chaud",
            "pf-froid",
            "full-color",
            "bicolor",
        ],
        whiteRotation: "white-rotation",
        colorWave: "color-wave",
        mappingGeometric: [
            "rectangle-doors",
            "face-line",
            "double-face-line",
            "circle-pulse",
            "small-circle",
            "small-rect"
        ],
        mappingGeometricMoving: [
            "line-swipe",
        ],
        mappingWallPaper: [
            "clouds",
            "glowing-dots",
            "moving-grid",
            "dots-flow",
            "led-wall"
        ],
        monologue: [
            "monologue",
        ],
    },
    variables: {
        voices: {
            volume: 1.0,
            etMaintenantDuration: 1.25
        },
        monologue: {
            preSceneDuration: 6,
            chunkSize: [4, 9] satisfies Range,
            chunkDuration: [2.8, 4.4] satisfies Range,
            projectionDuration: [30, 50] satisfies Range,
            audioAmplitude: 0.25,
            gapDuration: 0.5,
        },
        ambient: {
            audioAmplitude: 0.45,
            audioProbability: 0.65,
        },
        ambientSwap: {
            audioAmplitude: 0.45,
            audioProbability: 0.32,
            stepDuration: [35, 60] satisfies Range,
        },
        isolations: {
            audioProbability: 0.32,
            audioAmplitude: 0.30,
        },
        isolationsAlternate: {
            stepDuration: [17, 32] satisfies Range,
        },
        whiteRotation: {
            audioAmplitude: 0.8
        },
        colorWave: {
            audioProbability: 0.7,
            audioAmplitude: 0.40,
            audioDuration: [40, 70] satisfies Range,
        },
        mappingGeometric: {
            audioProbability: 0.55,
            audioAmplitude: 0.40,
            audioDuration: [40, 70] satisfies Range,
        },
        mappingGeometricMoving: {
            audioStandardProbability: 0.25,
            audioStandardAmplitude: 0.50,
            audioStandardDuration: [30, 50] satisfies Range,

            audioAmbientProbability: 0.65,
            audioAmbientAmplitude: 0.40,
        },
        mappingWallpaper: {
            audioStandardProbability: 0.25,
            audioStandardAmplitude: 0.50,
            audioStandardDuration: [30, 50] satisfies Range,

            audioAmbientProbability: 0.65,
            audioAmbientAmplitude: 0.40,
        },
        confessionnal: {
            duration: 90,
            thresholds: [0.33, 0.66],
        },
        projInput: {
            projectionDuration: 6.1,
            gapDuration: 0.5,
        },
        basculeLoud: {
            audioAmplitude: 0.9,
            basculeDuration: [11, 25] satisfies Range,
            startMargin: 30,
            endMargin: 10,
            minSpaceBetweenEvents: 20,
            occurencesCap: 5,
            fadeAudioOffset: 0.95
        },
        basculeAmbient: {
            audioAmbientAmplitude: 0.45,
            basculeDuration: [17, 35] satisfies Range,
            startMargin: 30,
            endMargin: 10,
            minSpaceBetweenEvents: 40,
            occurencesCap: 5,
            fadeAudioOffset: 0.95
        },
        intro: {
            lightsOffset: 7.5,
            speechDuration: 22.5,
            phase1Range: [0.9, 5.2] satisfies Range,
            phase2Range: [4.5, 9.1] satisfies Range,
            fade: 0.2,
            volume: 0.638,
        },
        outro: {
            lightsOffset: 7.5,
            range: [1.5, 8] satisfies Range,
            lightsFade: 0.4,
            preSceneDuration: 4.2,
            interBlackout: 1.,
            volume: 0.722,
            depresentationVolume: 0.488,
            endBlackout: 4.5,
        }
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
        intro: [55, 90],
        outro: [27, 45],
        monologue: [70, 120],
        ultraShort: [4, 8],
        short: [30, 70],
        specialAmbiances: [45, 90],
        mediumShort: [60, 120],
        standard: [90, 240],
        standardLong: [160, 350],
        long: [240, 480],
    } satisfies { [key: string]: Range },
    blackouts: {
        intro: 0.5,
        outro: 5,
        confessionnal: 4,
        standard: [2.5, 4.5],
    } satisfies { [key: string]: Range|number },
    audioLibs: {
        ambient: "aleas-general",
        general: "aleas-general",
        intense: "aleas-intense",
        instru: "aleas-instru",
        billetreduc: "aleas-billetreduc",
        voices: "voices",
    } satisfies { [key: string]: string },
}


export function getTheatreDuTempsSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {

    const factories: ((libraries: LoadedLibraries) => AleasSceneTemplate)[] = Object.values(theatreDuTemps.templates);

    const templates = factories.map(factory => factory(libraries));

    return templates;
};


export function generateTheatreDuTempsIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const audioFade = theatreDuTemps.fades.audioUltraShort;
    const audioFadeIn = getValue(audioFade);
    const audioFadeOut = getValue(audioFade);

    const {
        fade: lightFade,
        lightsOffset,
        speechDuration,
        phase1Range,
        phase2Range,
        volume
    } = theatreDuTemps.variables.intro;

    const duration = getValue(theatreDuTemps.durations.intro);

    const audio: AudioElement[] = [
        {
            track: "intro - 001",
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
        scene: theatreDuTemps.sceneContent.intro,
        duration,
        fadeIn: lightFade,
        fadeOut: lightFade,
        stepsKeyFrames
    });

    return {
        templateName: "intro",
        duration,
        info: "Intro scene",
        hasPreScene: false,
        blackout: theatreDuTemps.blackouts.intro,
        hasAudio: true,
        audio,
        hasContent: true,
        content,
    }
}

export function generateTheatreDuTempsOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const audioFade = theatreDuTemps.fades.audioUltraShort;
    const audioFadeIn = getValue(audioFade);
    const audioFadeOut = getValue(audioFade);

    const {
        lightsFade,
        lightsOffset,
        interBlackout,
        range: salutsRange,
        volume,
        depresentationVolume,
        endBlackout
    } = theatreDuTemps.variables.outro;

    const duration = getValue(theatreDuTemps.durations.outro);

    const voiceIndex = randomVoiceIndex();

    const audio: AudioElement[] = [
        {
            track: "intro - 001",
            startTime: 0,
            duration: duration + endBlackout,
            amplitude: 1,
            volume: [
                [0, 0],
                [audioFadeIn, volume],
                [duration - audioFadeOut, volume],
                [duration, depresentationVolume],
                [duration + endBlackout, 0]
            ]
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
        scene: theatreDuTemps.sceneContent.outro,
        duration,
        fadeIn: lightsFade,
        fadeOut: lightsFade,
        stepsKeyFrames
    });

    return {
        templateName: "outro",
        duration,
        info: "Outro scene",
        blackout: theatreDuTemps.blackouts.outro,
        hasAudio: true,
        audio,
        hasContent: true,
        content,
        hasPreScene: true,
        preScene: {
            duration: theatreDuTemps.variables.outro.preSceneDuration,
            audio: {
                volume: theatreDuTemps.variables.voices.volume,
                track: `salutation-${voiceIndex.toString().padStart(2, "0")}`,
            },
            text: [
                [0, "Et maintenant"],
                [theatreDuTemps.variables.voices.etMaintenantDuration, "nous allons saluer"]
            ],
            gapDuration: theatreDuTemps.variables.outro.interBlackout
        }
    }
}