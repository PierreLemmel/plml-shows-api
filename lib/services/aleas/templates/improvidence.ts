import { notImplemented, random01, randomBool, randomElement, randomInt, randomRange, sequence } from "../../core/utils";
import { CalculateParamValArgs, LoadedLibraries, StartAndDuration, Range, makeSceneProvider, AleasSceneTemplate, SceneBaseInfo, AudioElementsOrNoAudio, KeyFrame, SceneData, GenerateAleasShowArgs, ContentElementOrNoContent, ContentElement, AudioElement } from "../aleas-generation";
import { calculateEnabled, calculateWeight, chunkifyText, createStandardLevel, generateAudioElements, generateComparableStepsKeyFrames, generateContentElement, GenerateContentElementArgs, generateInitialStep, generateIntermittentIntervals, generateIntroKeyFrames, generateOutroKeyFrames, generatePeriodicEvent, generateRandomDurations, getFade, getRandomDuration, getRandomElementFromAudioLib, getRandomMonologue, getRandomProjectionInput, getRandomSceneFromScenes, getStepCount, getValue, getWholeRangeAmplitude, keyFramesFromIntervals, ScenesGroup, VKFRecord, VKFRecordElement } from "../aleas-generation-utils";

export const improvidence = {
    templates: {
        "simple-standard-duration": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "simple-standard-duration";
            const templateInfo = "Simple scene with basic lights and standard duration";

            const availableDurations = [
                improvidence.durations.short,
                improvidence.durations.standard,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improvidence.sceneContent.standard
            ];


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fadeIn = improvidence.fades.standard;
                const fadeOut = improvidence.fades.standard;

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
                requiredFeatures: [],
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
                improvidence.audioLibs.general,
            ]

            const availableDurations = [
                improvidence.durations.standard,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improvidence.sceneContent.standard,
            ];

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fadeIn = improvidence.fades.standard;
                const fadeOut = improvidence.fades.standard;

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
                requiredFeatures: [],
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
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
                improvidence.durations.standardLong,
                improvidence.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                improvidence.sceneContent.ambient,
            ];

            const audioProbability = improvidence.variables.ambient.audioProbability;
            const audioLibs = [
                "aleas-general",
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = improvidence.fades.standard;

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
                    const audioAmplitude = improvidence.variables.ambient.audioAmplitude;

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
                requiredFeatures: [],
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
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
                improvidence.durations.standardLong,
                improvidence.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                improvidence.sceneContent.ambientSwap,
            ];

            const audioProbability = improvidence.variables.ambientSwap.audioProbability;
            const audioLibs = [
                "aleas-general",
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = improvidence.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(ambientScenes);
                const steps = getStepCount(libraries.contentLibraries, scene);

                const stepsKeyFrames: KeyFrame[][] = generateComparableStepsKeyFrames({
                    steps: steps,
                    totalDuration: duration,
                    fade: [fadeMin, fadeMax],
                    stepDuration: improvidence.variables.ambientSwap.stepDuration,
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
                    const audioAmplitude = improvidence.variables.ambient.audioAmplitude;

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
                requiredFeatures: [],
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
                improvidence.durations.ultraShort
            ];

            const availableFades: Range[] = [
                improvidence.fades.ultraShort
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improvidence.sceneContent.standard,
                improvidence.sceneContent.ambient,
                improvidence.sceneContent.isolations
            ];


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
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
                    maxOccurences: 4,
                    minProgress: 0.1,
                    maxProgress: 0.9
                }),
                weight: calculateWeight({
                    penalty: 13,
                    base: 16,
                    slope: 45
                }),
                requiredFeatures: [],
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
                improvidence.durations.short,
                improvidence.durations.standard,
            ];

            const availableFades: Range[] = [
                improvidence.fades.short,
                improvidence.fades.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improvidence.sceneContent.isolations
            ];

            const audioLibs = [
                improvidence.audioLibs.general,
            ];

            const audioProbability = improvidence.variables.isolations.audioProbability;

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
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
                    const audioAmplitude = improvidence.variables.isolations.audioAmplitude;

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
                requiredFeatures: [],
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
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
            ];

            const availableFades: Range[] = [
                improvidence.fades.standard
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improvidence.sceneContent.isolationsAlternates
            ];


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
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
                    stepDuration: improvidence.variables.isolationsAlternate.stepDuration,
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
                requiredFeatures: [],
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
                improvidence.durations.specialAmbiances
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const wrScenes = [
                improvidence.sceneContent.whiteRotation,
            ];

            const audioLibs = [
                improvidence.audioLibs.loud,
                improvidence.audioLibs.standalone,
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = improvidence.fades.standard;

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

                const [fadeMin, fadeMax] = improvidence.fades.audioStandard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                const audioAmplitude = improvidence.variables.whiteRotation.audioAmplitude;

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
                requiredFeatures: [],
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
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
                improvidence.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const colorWaveScenes = [
                improvidence.sceneContent.colorWave,
            ];

            const audioProbability = improvidence.variables.colorWave.audioProbability;
            const audioAmplitude = improvidence.variables.colorWave.audioAmplitude;
            const audioDuration = improvidence.variables.colorWave.audioDuration;
            const audioLibraries = [
                improvidence.audioLibs.general,
                improvidence.audioLibs.instru
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = improvidence.fades.standard;

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
                        fadeDurationRange: improvidence.fades.audioStandard,
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
                requiredFeatures: [],
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
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
                improvidence.durations.standardLong,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const mappingScenes: ScenesGroup = [
                improvidence.sceneContent.mappingGeometric,
            ];

            const variables = improvidence.variables.mappingGeometric;
            const audioProbability = variables.audioProbability;
            const audioAmplitude = variables.audioAmplitude;
            const audioDuration = variables.audioDuration;
            
            const audioLibraries = [
                improvidence.audioLibs.general,
                improvidence.audioLibs.instru
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = improvidence.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(mappingScenes);

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
                        fadeDurationRange: improvidence.fades.audioStandard,
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
                    base: 40,
                    slope: 40,
                    penalty: 20
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
        "mapping-geometric-moving": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "mapping-geometric-moving";
            const templateInfo = "Mapping Geometric Moving";

            const availableDurations = [
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
                improvidence.durations.standardLong,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const mappingScenes: ScenesGroup = [
                improvidence.sceneContent.mappingGeometricMoving,
            ];

            const variables = improvidence.variables.mappingGeometricMoving;
            const {
                audioStandardProbability,
                audioStandardAmplitude,
                audioStandardDuration,
                audioAmbientProbability,
                audioAmbientAmplitude,
            } = variables;
            
            const audioStandardLibraries = [
                improvidence.audioLibs.general,
                improvidence.audioLibs.instru
            ]

            const audioAmbientLibraries = [
                improvidence.audioLibs.ambient,
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = improvidence.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(mappingScenes);

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

                const result = random01();

                if (result < audioStandardProbability) {

                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: audioStandardDuration,
                        fadeDurationRange: improvidence.fades.audioStandard,
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
                        fadeDurationRange: improvidence.fades.audioStandard,
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
                    maxOccurences: 3
                }),
                weight: calculateWeight({
                    base: 22,
                    slope: 22,
                    penalty: 18
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
        "mapping-wallpaper": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "mapping-wallpaper";
            const templateInfo = "Mapping Wallpaper";

            const availableDurations = [
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
                improvidence.durations.standardLong,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const mappingScenes: ScenesGroup = [
                improvidence.sceneContent.mappingWallPaper,
            ];

            const variables = improvidence.variables.mappingWallpaper;
            const {
                audioStandardProbability,
                audioStandardAmplitude,
                audioStandardDuration,
                audioAmbientProbability,
                audioAmbientAmplitude,
            } = variables;
            
            const audioStandardLibraries = [
                improvidence.audioLibs.general,
                improvidence.audioLibs.instru
            ]

            const audioAmbientLibraries = [
                improvidence.audioLibs.ambient,
            ]

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = improvidence.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                
                const scene = getRandomSceneFromScenes(mappingScenes);

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

                const result = random01();

                if (result < audioStandardProbability) {

                    const audio = generateAudioElements(libraries, {
                        sceneDuration: duration,
                        audioDurationRange: audioStandardDuration,
                        fadeDurationRange: improvidence.fades.audioStandard,
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
                        fadeDurationRange: improvidence.fades.audioStandard,
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
                    minProgress: 0.21,
                }),
                weight: calculateWeight({
                    base: 40,
                    slope: 50,
                    penalty: 15
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
        "confessionnal": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "confessionnal";
            const templateInfo = "Confessionnal";

            const variables = improvidence.variables.confessionnal;
            const {
                duration,
                thresholds,
            } = variables;

            const durationRange: Range = [duration, duration];

            const scene = improvidence.sceneContent.confessionnal;

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = improvidence.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);

                const durationMadmapperMin = 60;
                const durationMadmapperMax = 180;

                const duration01 = (duration - durationMadmapperMin) / (durationMadmapperMax - durationMadmapperMin);

                const content = generateContentElement(libraries.contentLibraries, {
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
                requiredFeatures: [
                    "confessionnal",
                ],
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
                projectionDuration
            } = improvidence.variables.projInput;

            const availableDurations = [
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
                improvidence.durations.standardLong,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improvidence.sceneContent.projInput
            ];


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const fade = improvidence.fades.standardShort;

                const scene = getRandomSceneFromScenes(availableScenes);

                const stepsKeyFrames: KeyFrame[][] = generateInitialStep({
                    totalDuration: duration,
                    initialStepDuration: projectionDuration,
                    fade: improvidence.fades.standard,
                })

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn: fade,
                    fadeOut: fade,
                    paramValues: {
                        strings: {
                            "input": getRandomProjectionInput(libraries.inputProjectionLibraries)
                        }
                    },
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
                enabled: calculateEnabled({
                    minProgress: 0.3,
                    maxOccurences: 3
                }),
                weight: calculateWeight({
                    base: 60,
                    slope: 30,
                    penalty: 25
                }),
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
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
            } = improvidence.variables.basculeLoud;
            
            const availableDurations = [
                improvidence.durations.standard,
                improvidence.durations.standardLong,
                improvidence.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const basculesScenes = [
                improvidence.sceneContent.basculePF,
            ];

            const basculeAudioLibs = [
                improvidence.audioLibs.loud,
                improvidence.audioLibs.standalone,
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

                const fadeToBascule = getValue(improvidence.fades.ultraShort);
                const fadeBack = getValue(improvidence.fades.standardShort);

                return {
                    bascules,
                    fadeToBascule,
                    fadeBack
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

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: BasculeMoreArgs): ContentElementOrNoContent => {

                const {
                    bascules,
                    fadeToBascule,
                    fadeBack
                } = moreArgs;
                

                const fadeIn = improvidence.fades.standard;
                const fadeOut = improvidence.fades.standard;
                
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
                    maxOccurences: 3
                }),
                weight: calculateWeight({
                    base: 30,
                    slope: 40,
                    penalty: 22
                }),
                requiredFeatures: [],
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
            } = improvidence.variables.basculeAmbient;
            
            const availableDurations = [
                improvidence.durations.standard,
                improvidence.durations.standardLong,
                improvidence.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const basculesScenes = [
                improvidence.sceneContent.basculeAmbient,
            ];

            const basculeAudioLibs = [
                improvidence.audioLibs.ambient,
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

                const fadeToBascule = getValue(improvidence.fades.standard);
                const fadeBack = getValue(improvidence.fades.standard);

                return {
                    bascules,
                    fadeToBascule,
                    fadeBack
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

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: BasculeMoreArgs): ContentElementOrNoContent => {

                const {
                    bascules,
                    fadeToBascule,
                    fadeBack
                } = moreArgs;
                

                const fadeIn = improvidence.fades.standard;
                const fadeOut = improvidence.fades.standard;
                
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
                    maxOccurences: 3
                }),
                weight: calculateWeight({
                    base: 20,
                    slope: 40,
                    penalty: 20
                }),
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                    getAudio,
                    getMoreArgs
                }, libraries),
                durationRange
            }
        },
        "autos": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "autos";
            const templateInfo = "Autos";

            const {
                trackingPeriod,
                trackingPause
            } = improvidence.variables.autos;
            
            const availableDurations = [
                improvidence.durations.specialAmbiances,
                improvidence.durations.mediumShort,
                improvidence.durations.standard,
            ];

            const audioLibs = [
                improvidence.audioLibs.ambient,
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {


                const fadeIn = improvidence.fades.standard;
                const fadeOut = improvidence.fades.standard;
                
                const autosScenes = improvidence.sceneContent.autos;
                const scene = getRandomSceneFromScenes(autosScenes);

                const [ stopMin, stopMax ] = trackingPause;
                const [ periodMin, periodMax ] = trackingPeriod;
                const stopMean = (stopMin + stopMax) / 2;
                const periodMean = (periodMin + periodMax) / 2;

                const stopRatio = stopMean / (stopMean + periodMean);
                
                const generateRecordElement: (() => VKFRecordElement) = () => {
                    const frames: KeyFrame[] = []
                    
                    let time = 0;

                    let goUp = randomBool();
                    let pause = random01() < stopRatio;

                    let val;
                    let nextPauseDuration;
                    let nextPeriodDuration;

                    if (pause) {
                        val = goUp ? 0 : 1;
                        nextPauseDuration = random01() * randomRange(stopMin, stopMax);
                        nextPeriodDuration = randomRange(periodMin, periodMax);
                    }
                    else {
                        nextPauseDuration = randomRange(stopMin, stopMax);
                        
                        const alreadyDone = random01();

                        val = goUp ? alreadyDone : 1 - alreadyDone;
                        nextPeriodDuration = (1 - alreadyDone) * randomRange(periodMin, periodMax);
                    }
                    
                    while (time + (pause ? nextPauseDuration : nextPeriodDuration) < duration) {
                     
                        frames.push([time, val]);

                        if (pause) {
                            time += nextPauseDuration;
                            nextPauseDuration = randomRange(stopMin, stopMax);
                        }
                        else {
                            time += nextPeriodDuration;
                            val = goUp ? 1 : 0;

                            nextPeriodDuration = randomRange(periodMin, periodMax);
                            goUp = !goUp;
                        }

                        frames.push([time, val]);

                        pause = !pause;
                    }

                    if (pause) {
                        
                    }
                    else {
                        const remainToDo = (duration - time) / nextPeriodDuration;
                        
                        val = goUp ? remainToDo : 1 - remainToDo;
                    }

                    time = duration;

                    frames.push([time, val]);

                    return {
                        type: "float",
                        frames
                    };
                }

                const vkf: VKFRecord = {
                    "jar1Pan": generateRecordElement(),
                    "jar1Tilt": generateRecordElement(),
                    "jar2Pan": generateRecordElement(),
                    "jar2Tilt": generateRecordElement(),
                    "cour1Pan": generateRecordElement(),
                    "cour1Tilt": generateRecordElement(),
                    "cour2Pan": generateRecordElement(),
                    "cour2Tilt": generateRecordElement(),
                }

                const content = generateContentElement(libraries.contentLibraries, {
                    scene,
                    duration,
                    fadeIn,
                    fadeOut,
                    valuesKeyFrames: vkf
                })

                return {
                    hasContent: true,
                    content
                }
            }

            const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

                const [fadeMin, fadeMax] = improvidence.fades.audioStandard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);
                const audioAmplitude = improvidence.variables.autos.audioAmplitude;

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
                enabled: calculateEnabled({
                    minProgress: 0.3,
                    maxOccurences: 2
                }),
                weight: calculateWeight({
                    base: 20000,
                    slope: 45,
                    penalty: 20
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
        "monologue": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "monologue";
            const templateInfo = "Monologue";

            const {
                projectionDuration,
                chunkDuration,
                chunkSize,
                audioAmplitude
            } = improvidence.variables.monologue;

            const availableDurations = [
                improvidence.durations.monologue
            ];

            const audioLibs = [
                improvidence.audioLibs.instru
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                improvidence.sceneContent.monologue
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

                const [fadeMin, fadeMax] = improvidence.fades.audioStandard;

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

                const fade = improvidence.fades.standardShort;

                const scene = getRandomSceneFromScenes(availableScenes);

                const chunkDurVal = randomRange(chunkDuration[0], chunkDuration[1]);
                const chunkCount = Math.round(randomRange(projectionDuration[0], projectionDuration[1]) / chunkDurVal);

                const step1Duration = chunkCount * chunkDurVal;
                const stepsKeyFrames: KeyFrame[][] = generateInitialStep({
                    totalDuration: duration,
                    initialStepDuration: step1Duration,
                    fade: improvidence.fades.short,
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
                enabled: calculateEnabled({
                    minProgress: 0.3,
                    maxOccurences: 2,
                    maxProgress: 0.92
                }),
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
        autos: "autos"
    },
    sceneContent: {
        intro: "intro",
        outro: "outro",
        confessionnal: "confessionnal",
        standard: [
            "pf-chaud",
        ],
        ambient: [
            "full-color",
            "bicolor",
            "tricolor",
        ],
        isolations: [
            "douche",
            "lat-jar",
            "diag-cour"
        ],
        isolationsAlternates: [
            "lats-alternate",
            "diags-alternate",
        ],
        ambientSwap: [
            "col-swap-2",
            "col-swap-3",
        ],
        basculePF: [
            "pf-ch-basc-col",
            "pf-ch-basc-str",
        ],
        basculeAmbient: [
            "col-basc-douche",
        ],
        projInput: [
            "proj-input",
        ],
        monologue: [
            "monologue",
        ],
        whiteRotation: "white-rotation",
        colorWave: "color-wave",
        mappingGeometric: [
            "face-line",
            "double-face-line",
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
        autos: [
            "autos-tracking"
        ]
    },
    variables: {
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
            projectionDuration: 10,
        },
        monologue: {
            chunkSize: [4, 7] satisfies Range,
            chunkDuration: [3, 4.7] satisfies Range,
            projectionDuration: [30, 50] satisfies Range,
            audioAmplitude: 0.48,
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
        },
        outro: {
            lightsOffset: 7.5,
            range: [1.5, 8] satisfies Range,
            lightsFade: 0.4,
            interBlackout: 1.5,
        },
        autos: {
            trackingPeriod: [5, 9] satisfies Range,
            trackingPause: [0, 4.5] satisfies Range,
            audioAmplitude: 0.45
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
        ultraShort: [4, 8],
        short: [30, 70],
        specialAmbiances: [45, 90],
        monologue: [70, 120],
        mediumShort: [50, 110],
        standard: [80, 220],
        standardLong: [160, 350],
        long: [240, 480],
    } satisfies { [key: string]: Range },
    audioLibs: {
        general: "aleas-general",
        loud: "aleas-loud",
        ambient: "aleas-general",
        standalone: "aleas-standalone",
        wtf: "aleas-wtf",
        instru: "aleas-instru",
        text: "aleas-text",
        billetreduc: "aleas-billetreduc",
        voices: "voices",
    } satisfies { [key: string]: string },
}


export function getImprovidenceSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {

    const factories: ((libraries: LoadedLibraries) => AleasSceneTemplate)[] = Object.values(improvidence.templates);

    const templates = factories.map(factory => factory(libraries));

    return templates;
};


export function generateImprovidenceIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const audioFade = improvidence.fades.audioUltraShort;
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
    } = improvidence.variables.intro;

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
        scene: improvidence.sceneContent.intro,
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

export function generateImprovidenceOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const audioFade = improvidence.fades.audioUltraShort;
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
    } = improvidence.variables.outro;

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
        scene: improvidence.sceneContent.outro,
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