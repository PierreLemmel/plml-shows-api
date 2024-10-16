import { get } from "http";
import { notImplemented, random01, randomElement, randomInt, randomRange, sequence } from "../../core/utils";
import { CalculateParamValArgs, LoadedLibraries, StartAndDuration, Range, makeSceneProvider, AleasSceneTemplate, SceneBaseInfo, AudioElementsOrNoAudio, KeyFrame, SceneData, GenerateAleasShowArgs, ContentElementOrNoContent, ContentElement, GenerateAleasHasPresentationArgs } from "../aleas-generation";
import { createStandardLevel, generateAudioElements, generateComparableStepsKeyFrames, generateContentElement, generateInitialStep, generateIntermittentIntervals, generatePeriodicEvent, generateRandomDurations, getFade, getRandomDuration, getRandomElementFromAudioLib, getRandomProjectionInput, getRandomSceneFromScenes, getStepCount, getValue, getWholeRangeAmplitude, ScenesGroup } from "../aleas-generation-utils";

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


            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
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
                enabled: true,
                weight: 10,
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
                theatreDuTemps.audioLibs.general,
            ]

            const availableDurations = [
                theatreDuTemps.durations.standard,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.standard,
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
                enabled: true,
                weight: 20,
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
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                theatreDuTemps.sceneContent.ambient,
            ];

            const audioProbability = theatreDuTemps.variables.ambient.audioProbability;
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
                weight: 20,
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
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                theatreDuTemps.sceneContent.ambientSwap,
            ];

            const audioProbability = theatreDuTemps.variables.ambientSwap.audioProbability;
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
                enabled: true,
                weight: 20,
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
                theatreDuTemps.durations.ultraShort
            ];

            const availableFades: Range[] = [
                theatreDuTemps.fades.ultraShort
            ]

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.standard,
                theatreDuTemps.sceneContent.ambient,
                theatreDuTemps.sceneContent.isolations
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
                enabled: true,
                weight: 10,
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

            const audioLibs = [
                theatreDuTemps.audioLibs.general,
            ];

            const audioProbability = theatreDuTemps.variables.isolations.audioProbability;

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
                weight: 10,
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
                enabled: true,
                weight: 10,
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
                theatreDuTemps.durations.specialAmbiances
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const wrScenes = [
                theatreDuTemps.sceneContent.whiteRotation,
            ];

            const audioLibs = [
                theatreDuTemps.audioLibs.loud,
                theatreDuTemps.audioLibs.standalone,
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
                enabled: true,
                weight: 20,
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

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
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
                enabled: true,
                weight: 20,
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
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.long,
            ];

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
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

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
                enabled: true,
                weight: 20,
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
                theatreDuTemps.durations.mediumShort,
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.long,
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

            const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

                const duration = getRandomDuration(...availableDurations);
        
                return {
                    templateName,
                    duration,
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

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
                enabled: true,
                weight: 20,
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
                    info: templateInfo
                }
            }

            const getContent = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ContentElementOrNoContent => {

                const [fadeMin, fadeMax] = theatreDuTemps.fades.standard;

                const fadeIn = randomRange(fadeMin, fadeMax);
                const fadeOut = randomRange(fadeMin, fadeMax);

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
            } = theatreDuTemps.variables.projInput;

            const availableDurations = [
                theatreDuTemps.durations.standard,
                theatreDuTemps.durations.standardLong,
                theatreDuTemps.durations.long,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                theatreDuTemps.sceneContent.projInput
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

                const fade = theatreDuTemps.fades.standardShort;

                const scene = getRandomSceneFromScenes(availableScenes);

                const stepsKeyFrames: KeyFrame[][] = generateInitialStep({
                    totalDuration: duration,
                    initialStepDuration: projectionDuration,
                    fade: theatreDuTemps.fades.standard,
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
                enabled: true,
                weight: 10,
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getContent,
                }, libraries),
                durationRange
            }
        }
        // "projection-input": function(libraries: LoadedLibraries): AleasSceneTemplate {
        //     const templateName = "projection-input";
        //     const templateInfo = "Simple scene with a projection input";

        //     const availableDurations = [
        //         theatreDuTemps.durations.short,
        //         theatreDuTemps.durations.standard,
        //     ];

        //     const projectionDuration = 8;

        //     const durationRange = getWholeRangeAmplitude(...availableDurations);
        //     const availableScenes: string[][] = [
        //         theatreDuTemps.sceneContent.standardScenes,
        //         theatreDuTemps.sceneContent.specials,
        //     ];

        //     const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        //         const duration = getRandomDuration(...availableDurations);
        
        //         return {
        //             templateName,
        //             duration,
        //             info: templateInfo
        //         }
        //     }
        
        //     const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
        
        //         const fadeIn = randomRange(2, 6);
        //         const fadeOut = randomRange(2, 6);
        //         const amplitude = 0.6;

        //         const scene = getRandomSceneFromScenes(availableScenes);
        
        //         const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

        //         const level = createStandardLevel({
        //             duration: duration - projectionDuration,
        //             fadeIn,
        //             fadeOut,
        //             offset: projectionDuration,
        //         });

        //         return {
        //             hasLights: true,
        //             lights: [
        //                 {
        //                     scene,
        //                     amplitude,
        //                     level,
        //                     elements: valueSegments
        //                 }
        //             ]
        //         }
        //     }

        //     const getProjection = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ProjectionsElementsOrNoProjections => {
                    
        //         const text = getRandomProjectionInput(libraries.inputProjectionLibraries);
        //         return {
        //             hasProjections: true,
        //             projections: [
        //                 {
        //                     type: "text",
        //                     text,
        //                     startTime: 0,
        //                     duration: projectionDuration,
        //                     fadeIn: 1.0,
        //                     fadeOut: 1.0
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
        //             } = args;

        //             return progress > 0.20;
        //         },
        //         weight: (args: CalculateParamValArgs) => {

        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const penalty = 9;
        //             const occurences = history.counts[templateName] || 0;

        //             const base = 50;
        //             const slope = 5;

        //             return Math.max(
        //                 base + progress * slope - occurences * penalty,
        //                 0
        //             );
        //         },
        //         requiredFeatures: [
        //             "projections"
        //         ],
        //         value: makeSceneProvider({
        //             getBaseInfo,
        //             getLights,
        //             getProjection
        //         }, libraries),
        //         durationRange
        //     }
        // },
        // "confessionnal": function(libraries: LoadedLibraries): AleasSceneTemplate { 
        //     const templateName = "confessionnal";
        //     const templateInfo = "Confessionnal";

        //     const thresholds = [ 0.33, 0.66];
        //     const confessionnalsCount = thresholds.length;

        //     const confessionnalDuration = 120;

        //     const durationRange: Range = [confessionnalDuration, confessionnalDuration];
        //     const confessionnalScene = theatreDuTemps.sceneContent.confessionnal;

        //     const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        //         const duration = confessionnalDuration;
        
        //         return {
        //             templateName,
        //             duration,
        //             info: templateInfo
        //         }
        //     }
        
        //     const getLights = (args: CalculateParamValArgs, duration: number): LightsElementsOrNoLights => {
        
        //         const fadeIn = randomRange(1, 3);
        //         const fadeOut = randomRange(3, 5);
        //         const amplitude = 1;

        //         const scene = confessionnalScene;
        
        //         const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

        //         const level = createStandardLevel({
        //             duration,
        //             fadeIn,
        //             fadeOut,
        //         });

        //         return {
        //             hasLights: true,
        //             lights: [
        //                 {
        //                     scene,
        //                     amplitude,
        //                     level,
        //                     elements: valueSegments
        //                 }
        //             ]
        //         }
        //     }

        //     const getProjection = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): ProjectionsElementsOrNoProjections => {
                        
        //         return {
        //             hasProjections: true,
        //             projections: [
        //                 {
        //                     type: "timer",
        //                     timer: confessionnalDuration,
        //                     startTime: 0,
        //                 }
        //             ]
        //         }
        //     }

        //     return {
        //         name: templateName,
        //         isPriority: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;

        //             return (progress > thresholds[0] && occurences < 1)
        //                 || (progress > thresholds[1] && occurences < 2);
        //         },
        //         enabled: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;

        //             return (progress > thresholds[0] && occurences < 1)
        //                 || (progress > thresholds[1] && occurences < 2);
        //         },
        //         weight: 0,
        //         requiredFeatures: [
        //             "confessionnal",
        //             "projections"
        //         ],
        //         value: makeSceneProvider({
        //             getBaseInfo,
        //             getLights,
        //             getProjection,
        //         }, libraries),
        //         durationRange
        //     }
        // },
        // "crudes": function(libraries: LoadedLibraries): AleasSceneTemplate {
        //     const templateName = "crudes";
        //     const templateInfo = "Crude scenes";

        //     const availableDurations = [
        //         theatreDuTemps.durations.short,
        //         theatreDuTemps.durations.standard,
        //         theatreDuTemps.durations.long
        //     ];

        //     const durationRange = getWholeRangeAmplitude(...availableDurations);
        //     const availableScenes: string[][] = [
        //         theatreDuTemps.sceneContent.crudes
        //     ];

        //     const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        //         const duration = getRandomDuration(...availableDurations);
        
        //         return {
        //             templateName,
        //             duration,
        //             info: templateInfo
        //         }
        //     }
        
        //     const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
        
        //         const fadeIn = randomRange(2, 5);
        //         const fadeOut = randomRange(2, 5);
        //         const amplitude = randomRange(0.6, 1.0);

        //         const scene = getRandomSceneFromScenes(availableScenes);
        
        //         const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

        //         const level = createStandardLevel({
        //             duration,
        //             fadeIn,
        //             fadeOut,
        //         });

        //         return {
        //             hasLights: true,
        //             lights: [
        //                 {
        //                     scene,
        //                     amplitude,
        //                     level,
        //                     elements: valueSegments
        //                 }
        //             ]
        //         }
        //     }

        //     const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

        //         const audioOdds = 0.6;

        //         if (Math.random() > audioOdds) {
        //             const audio = generateAudioElements(libraries, {
        //                 sceneDuration: duration,
        //                 audioDurationRange: [20, 60],
        //                 fadeDurationRange: [1.5, 3.0],
        //                 amplitude: 0.7,
        //                 startEndMargin: 10,
        //                 minSpaceBetweenAudio: 40,
        //                 audioLibraries: ["aleas-general"]
        //             });

        //             return {
        //                 hasAudio: true,
        //                 audio
        //             }
        //         }
        //         else {
        //             return {
        //                 hasAudio: false
        //             }
        //         }
        //     }

        //     return {
        //         name: templateName,
        //         isPriority: false,
        //         enabled: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //             } = args;
                    

        //             return progress > 0.08;
        //         },
        //         weight: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const penalty = 5;
        //             const occurences = history.counts[templateName] || 0;

        //             const base = 10;
        //             const slope = 20;

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
        // "crudes-alternates": function(libraries: LoadedLibraries): AleasSceneTemplate {
        //     const templateName = "crudes-alternates";
        //     const templateInfo = "Crude scenes - Alternate";

        //     const availableDurations = [
        //         theatreDuTemps.durations.short,
        //         theatreDuTemps.durations.standard,
        //         theatreDuTemps.durations.long
        //     ];
        //     const durationRange = getWholeRangeAmplitude(...availableDurations);

        //     const stepRangeSeed = [6, 10];
        //     const minMidDuration = 8;
            
        //     const availableScenes: string[][][] = [
        //         theatreDuTemps.sceneContent.crudesAlternates
        //     ];

        //     const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        //         const duration = getRandomDuration(...availableDurations);
        
        //         return {
        //             templateName,
        //             duration,
        //             info: templateInfo
        //         }
        //     }
        
        //     const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
        
        //         const fade = randomRange(2, 5);
        //         const amplitude = randomRange(0.6, 1.0);

        //         const sceneLib = randomElement(availableScenes);
        //         const scenes = randomElement(sceneLib);

        //         const seed = randomRange(stepRangeSeed[0], stepRangeSeed[1]);
        //         const midDuration = Math.max(
        //             duration / seed,
        //             minMidDuration
        //         );

        //         const steps = generateRandomDurations({
        //             totalDuration: duration,
        //             range: [midDuration / 2, midDuration * 1.5]
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
        //         let j = init;
        //         for (let i = 0; i < steps.length ; i++, j++) {
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

        
        //         const lights: LightsElement[] = scenes.map((scene, i) => {
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
        //             lights
        //         }
        //     }

        //     const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

        //         const audioOdds = 0.6;

        //         if (Math.random() > audioOdds) {
        //             const audio = generateAudioElements(libraries, {
        //                 sceneDuration: duration,
        //                 audioDurationRange: [20, 60],
        //                 fadeDurationRange: [1.5, 3.0],
        //                 amplitude: 0.7,
        //                 startEndMargin: 10,
        //                 minSpaceBetweenAudio: 40,
        //                 audioLibraries: ["aleas-general"]
        //             });

        //             return {
        //                 hasAudio: true,
        //                 audio
        //             }
        //         }
        //         else {
        //             return {
        //                 hasAudio: false
        //             }
        //         }
        //     }

        //     return {
        //         name: templateName,
        //         isPriority: false,
        //         enabled: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //             } = args;

        //             return progress > 0.15;
        //         },
        //         weight: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;
        //             const penalty = 8;

        //             const base = 0;
        //             const slope = 30;

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
        // "ultra-short": function(libraries: LoadedLibraries): AleasSceneTemplate {

        //     const templateName = "ultra-short";
        //     const templateInfo = "Scene with ultra short duration";
            
        //     const availableDurations = [
        //         theatreDuTemps.durations.ultraShort
        //     ];
        //     const durationRange = getWholeRangeAmplitude(...availableDurations);
            
        //     const availableScenes: string[][] = [
        //         theatreDuTemps.sceneContent.standardScenes,
        //         theatreDuTemps.sceneContent.crudes,
        //         theatreDuTemps.sceneContent.specials,
        //         theatreDuTemps.sceneContent.ambients.fullColor,
        //         theatreDuTemps.sceneContent.ambients.bicolor,
        //     ];

        //     const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        //         const duration = getRandomDuration(...availableDurations);
        
        //         return {
        //             templateName,
        //             duration,
        //             info: templateInfo
        //         }
        //     }
        
        //     const getLights = (args: CalculateParamValArgs, duration: number): LightsElementsOrNoLights => {
        
        //         const fadeIn = randomRange(1, 3);
        //         const fadeOut = randomRange(0.2, 0.8);

        //         const scene = getRandomSceneFromScenes(availableScenes);
        
        //         const valueSegments = getValuesFromScene(libraries.dmxScenes, scene);

        //         const level = createStandardLevel({
        //             duration,
        //             fadeIn,
        //             fadeOut,
        //         });

        //         return {
        //             hasLights: true,
        //             lights: [
        //                 {
        //                     scene,
        //                     amplitude: 1.0,
        //                     level,
        //                     elements: valueSegments
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
        //                 currentScene,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;
                    
        //             return progress > 0.18
        //                 && occurences <= 2
        //                 && currentScene > 3
        //                 && progress < 0.9;
        //         },
        //         weight: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;
        //             const penalty = 20;

        //             const base = 5;
        //             const slope = 60;

        //             return Math.max(
        //                 base + progress * slope - occurences * penalty,
        //                 0
        //             );
        //         },
        //         requiredFeatures: [],
        //         value: makeSceneProvider({
        //             getBaseInfo,
        //             getLights,
        //         }, libraries),
        //         durationRange
        //     }
        // },
        // "pf-bascule-ambient": function(libraries: LoadedLibraries): AleasSceneTemplate {
        //     const templateName = "pf-bascule-ambient";
        //     const templateInfo = "Plein Feux - Bascule - Ambient";

        //     const smokeDuration = 7;

        //     const basculeRange: Range = [15, 30];

        //     const availableDurations = [
        //         theatreDuTemps.durations.standard,
        //         theatreDuTemps.durations.long
        //     ];
        //     const durationRange = getWholeRangeAmplitude(...availableDurations);

        //     const standardScenes = [
        //         theatreDuTemps.sceneContent.standardScenes
        //     ]

        //     const ambientScenes = [
        //         theatreDuTemps.sceneContent.ambients.fullColor,
        //         theatreDuTemps.sceneContent.ambients.bicolor,
        //     ];

        //     const basculeAudioLibs = [
        //         "aleas-loud",
        //     ]

        //     type PfBasculeAmbientMoreArgs = {
        //         bascules: StartAndDuration[];
        //         fadeToAmbient: number;
        //         fadeToPF: number;
        //     }

        //     const getMoreArgs = (args: CalculateParamValArgs, duration: number) => {
        //         const bascules: StartAndDuration[] = generateIntermittentIntervals({
        //             totalDuration: duration,
        //             eventDurationRange: basculeRange,
        //             startMargin: 30,
        //             endMargin: 10,
        //             minSpaceBetweenEvents: 20,
        //             occurencesCap: 4
        //         });

        //         const fadeToAmbient = randomRange(1, 3);
        //         const fadeToPF = randomRange(2, 5);

        //         return {
        //             bascules,
        //             fadeToAmbient,
        //             fadeToPF
        //         }
        //     }

        //     const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        //         const duration = getRandomDuration(...availableDurations);
        
        //         return {
        //             templateName,
        //             duration,
        //             info: templateInfo
        //         }
        //     }
        
        //     const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: PfBasculeAmbientMoreArgs): LightsElementsOrNoLights => {
                
        //         const {
        //             bascules,
        //             fadeToAmbient,
        //             fadeToPF
        //         } = moreArgs;

        //         const ambientAmplitude = randomRange(0.6, 0.8);
        //         const pfAmplitude = randomRange(0.6, 1.0);
        //         const blackoutFade = randomRange(2.0, 5.0);

        //         const smokeFade = 0.1;

        //         const pfScene = getRandomSceneFromScenes(standardScenes);
        //         const ambientScene = getRandomSceneFromScenes(ambientScenes);

        //         const pfKeyFrames: KeyFrame[] = [];
        //         const ambientKeyFrames: KeyFrame[] = [];
        //         const smokeKeyFrames: KeyFrame[] = [];

        //         pfKeyFrames.push(
        //             [0, 0],
        //             [fadeToPF, 1],
        //         )

        //         ambientKeyFrames.push(
        //             [0, 0],
        //         )

        //         smokeKeyFrames.push(
        //             [0, 0],
        //         )

        //         for (const bascule of bascules) {
        //             const {
        //                 startTime,
        //                 duration: eltDuration
        //             } = bascule;

        //             pfKeyFrames.push(
        //                 [startTime, 1],
        //                 [startTime + fadeToAmbient, 0],
        //                 [startTime + eltDuration - fadeToPF, 0],
        //                 [startTime + eltDuration, 1]
        //             );

        //             ambientKeyFrames.push(
        //                 [startTime, 0],
        //                 [startTime + fadeToAmbient, 1],
        //                 [startTime + eltDuration - fadeToPF, 1],
        //                 [startTime + eltDuration, 0]
        //             );

        //             smokeKeyFrames.push(
        //                 [startTime, 0],
        //                 [startTime + smokeFade, 1],
        //                 [startTime + smokeDuration, 1],
        //                 [startTime + smokeDuration + smokeFade, 0]
        //             );
        //         }

        //         pfKeyFrames.push(
        //             [duration - blackoutFade, 1],
        //             [duration, 0]
        //         );

        //         const pfElement: LightsElement = {
        //             scene: pfScene,
        //             amplitude: pfAmplitude,
        //             level: pfKeyFrames,
        //             elements: getValuesFromScene(libraries.dmxScenes, pfScene)
        //         }

        //         const ambientElement: LightsElement = {
        //             scene: ambientScene,
        //             amplitude: ambientAmplitude,
        //             level: ambientKeyFrames,
        //             elements: getValuesFromScene(libraries.dmxScenes, ambientScene)
        //         }

        //         const smokeScene = theatreDuTemps.sceneContent.smoke;
        //         const smokeElement: LightsElement = {
        //             scene: smokeScene,
        //             amplitude: 1.0,
        //             level: smokeKeyFrames,
        //             elements: getValuesFromScene(libraries.dmxScenes, smokeScene)
        //         }

        //         return {
        //             hasLights: true,
        //             lights: [
        //                 pfElement,
        //                 ambientElement,
        //                 smokeElement
        //             ]
        //         }
        //     }

        //     const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries, moreArgs: PfBasculeAmbientMoreArgs): AudioElementsOrNoAudio => {

        //         const { bascules } = moreArgs;

        //         const audioFade = randomRange(0.5, 1.5);
        //         const audioAmplitude = 0.9;

        //         const audioLib = randomElement(basculeAudioLibs);
        //         const track = getRandomElementFromAudioLib(libraries.audioLibraries, audioLib);

        //         const audio = bascules.map(bascule => {
        //             const { startTime, duration: eltDuration } = bascule;

        //             return {
        //                 track,
        //                 startTime,
        //                 duration: eltDuration,
        //                 amplitude: audioAmplitude,
        //                 volume: createStandardLevel({
        //                     duration: eltDuration,
        //                     fadeIn: audioFade,
        //                     fadeOut: audioFade,
        //                 })
        //             }
        //         })

        //         return {
        //             hasAudio: true,
        //             audio
        //         }
        //     }

        //     return {
        //         name: templateName,
        //         isPriority: false,
        //         enabled: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //             } = args;

        //             return progress > 0.25;
        //         },
        //         weight: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;
        //             const penalty = 4;

        //             const base = 25;
        //             const slope = 70;

        //             return Math.max(
        //                 base + progress * slope - occurences * penalty,
        //                 0
        //             );
        //         },
        //         requiredFeatures: ["smokeMachine"],
        //         value: makeSceneProvider<PfBasculeAmbientMoreArgs>({
        //             getBaseInfo,
        //             getLights,
        //             getAudio,
        //             getMoreArgs
        //         }, libraries),
        //         durationRange
        //     }
        // },
        // "ambient-with-smoke": function(libraries: LoadedLibraries): AleasSceneTemplate {
        //     const templateName = "ambient-with-smoke";
        //     const templateInfo = "Ambient with smoke";

        //     const smokeDuration = 5.5;

        //     const smokeInterval = 40;

        //     const availableDurations = [
        //         theatreDuTemps.durations.short,
        //         theatreDuTemps.durations.standard,
        //         theatreDuTemps.durations.long,
        //     ];
        //     const durationRange = getWholeRangeAmplitude(...availableDurations);

        //     const ambientScenes = [
        //         theatreDuTemps.sceneContent.ambients.fullColor,
        //         theatreDuTemps.sceneContent.ambients.bicolor,
        //     ];
        //     const audioLibs = [
        //         "aleas-ambient",
        //     ]

        //     const getBaseInfo = (args: CalculateParamValArgs): SceneBaseInfo => {

        //         const duration = getRandomDuration(...availableDurations);
        
        //         return {
        //             templateName,
        //             duration,
        //             info: templateInfo
        //         }
        //     }
        
        //     const getLights = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): LightsElementsOrNoLights => {
                
        //         generatePeriodicEvent({
        //             totalDuration: 100,
        //             period: 40,
        //             duration: 10
        //         })

        //         const ambientAmplitude = randomRange(0.4, 0.7);
        //         const blackoutOffset = 3;
        //         const fadeIn = randomRange(2, 5);
        //         const fadeOut = randomRange(2, 5);

        //         const smokeFade = 0.1;

        //         const ambientScene = getRandomSceneFromScenes(ambientScenes);

        //         const ambientElement: LightsElement = {
        //             scene: ambientScene,
        //             amplitude: ambientAmplitude,
        //             level: createStandardLevel({
        //                 duration: duration - blackoutOffset,
        //                 fadeIn,
        //                 fadeOut,
        //             }),
        //             elements: getValuesFromScene(libraries.dmxScenes, ambientScene)
        //         }

        //         const smokeKeyFrames: KeyFrame[] = []; 
        //         const events = generatePeriodicEvent({
        //             totalDuration: duration,
        //             period: smokeInterval,
        //             duration: smokeDuration
        //         })
        //         events.forEach(event => {
        //             const { startTime } = event;

        //             smokeKeyFrames.push(
        //                 [startTime, 0],
        //                 [startTime + smokeFade, 1],
        //                 [startTime + smokeDuration, 1],
        //                 [startTime + smokeDuration + smokeFade, 0]
        //             );
        //         });

        //         const smokeScene = theatreDuTemps.sceneContent.smoke;
        //         const smokeElement: LightsElement = {
        //             scene: smokeScene,
        //             amplitude: 1.0,
        //             level: smokeKeyFrames,
        //             elements: getValuesFromScene(libraries.dmxScenes, smokeScene)
        //         }

        //         return {
        //             hasLights: true,
        //             lights: [
        //                 ambientElement,
        //                 smokeElement
        //             ]
        //         }
        //     }

        //     const getAudio = (args: CalculateParamValArgs, duration: number, libraries: LoadedLibraries): AudioElementsOrNoAudio => {

        //         const fadeIn = randomRange(2, 5);
        //         const fadeOut = randomRange(2, 4);
        //         const audioAmplitude = 0.3;

        //         const audioLib = randomElement(audioLibs);
        //         const track = getRandomElementFromAudioLib(libraries.audioLibraries, audioLib);

        //         return {
        //             hasAudio: true,
        //             audio: [{
        //                 track,
        //                 startTime: 0,
        //                 duration,
        //                 amplitude: audioAmplitude,
        //                 volume: createStandardLevel({
        //                     duration,
        //                     fadeIn,
        //                     fadeOut,
        //                 })
        //             }]
        //         }
        //     }

        //     return {
        //         name: templateName,
        //         isPriority: false,
        //         enabled: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //             } = args;

        //             return progress > 0.23;
        //         },
        //         weight: (args: CalculateParamValArgs) => {
        //             const {
        //                 progress,
        //                 history
        //             } = args;

        //             const occurences = history.counts[templateName] || 0;
        //             const penalty = 10;

        //             const base = 20;
        //             const slope = 20;

        //             return Math.max(
        //                 base + progress * slope - occurences * penalty,
        //                 0
        //             );
        //         },
        //         requiredFeatures: ["smokeMachine"],
        //         value: makeSceneProvider({
        //             getBaseInfo,
        //             getLights,
        //             getAudio,
        //         }, libraries),
        //         durationRange
        //     }
        // }
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
            "tricolor",
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
        basculeCol: [
            "col-basc-decoupe",
        ],
        projInput: [
            "proj-input",
        ],
        whiteRotation: "white-rotation",
        colorWave: "color-wave",
        mappingGeometric: [
            "rectangle-doors",
            "face-line",
            "double-face-line",
            "circle-pulse",
        ],
        mappingGeometricMoving: [
            "line-swipe",
        ],
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
        confessionnal: {
            duration: 120,
            thresholds: [0.33, 0.66],
        },
        projInput: {
            projectionDuration: 10,
        },
        basculeLoud: {
            audioAmplitude: 0.9,
            audioDuration: [11, 25] satisfies Range,
            startMargin: 30,
            endMargin: 10,
            minSpaceBetweenEvents: 20,
            occurencesCap: 5
        }
    },
    fades: {
        ultraShort: [0.2, 0.5],
        short: [0.7, 1.3],
        standardShort: [1.2, 3],
        standard: [1.5, 4.5],
        standardLong: [3, 6],
        long: [5, 9],

        audioShort: [1, 2.5],
        audioStandard: [2, 4],
    } satisfies { [key: string]: Range },
    durations: {
        ultraShort: [5, 8],
        short: [30, 80],
        specialAmbiances: [45, 90],
        mediumShort: [60, 120],
        standard: [90, 300],
        standardLong: [180, 450],
        long: [350, 600],
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


export function getTheatreDuTempsSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {

    const factories: ((libraries: LoadedLibraries) => AleasSceneTemplate)[] = Object.values(theatreDuTemps.templates);

    const templates = factories.map(factory => factory(libraries));

    return templates;
};



function generateIntroOutro(durationValue: number, libraries: LoadedLibraries): SceneData {
    const blackoutOffset = 3;
    const startOffset = 6.5;

    const lightAmplitude = 1;
    const introBaseScene = "pf chaud"
;    // const introBaseScene = "intro-outro-base";
    const lightFade = randomRange(0.2, 0.4);

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
        blackout: {
            preScene: startOffset,
            postScene: blackoutOffset
        },
        info: "Intro scene",
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
        hasContent: false
    }
}

export function generateTheatreDuTempsIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const {
        intro: {
            duration,
        }
    } = args;

    const durationValue = getValue(duration);

    const intro = generateIntroOutro(durationValue, libraries);
    return intro;
}

export function generateTheatreDuTempsOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const {
        outro: {
            duration,
        }
    } = args;

    const durationValue = getValue(duration);

    const outro = generateIntroOutro(durationValue, libraries);
    return outro;
}

export function generateTheatreDuTempsPresentationScene(args: GenerateAleasHasPresentationArgs, libraries: LoadedLibraries): SceneData {

    const stub: SceneData = {
        templateName: "preshow",
        duration: 10,
        blackout: {
            preScene: 3,
            postScene: 3
        },
        info: "Stub presentation scene",
        hasAudio: false,
        hasContent: false
    }
    return stub;
}