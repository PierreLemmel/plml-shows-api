import { randomElement, randomInt, randomRange, sequence } from "../../core/utils";
import { CalculateParamValArgs, LoadedLibraries, StartAndDuration, Range, makeSceneProvider, AleasSceneTemplate, SceneBaseInfo, LightsElementsOrNoLights, AudioElementsOrNoAudio, KeyFrame, LightsElement, ProjectionsElementsOrNoProjections, SceneData, GenerateAleasShowArgs, getValue } from "../aleas-generation";
import { createStandardLevel, generateAudioElements, generateIntermittentIntervals, generatePeriodicEvent, generateRandomDurations, getRandomDuration, getRandomElementFromAudioLib, getRandomProjectionInput, getRandomSceneFromScenes, getValuesFromScene, getWholeRangeAmplitude } from "../aleas-generation-utils";

export const improEnSeine = {
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


export function getImproEnSeineSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {

    const factories: ((libraries: LoadedLibraries) => AleasSceneTemplate)[] = Object.values(improEnSeine.templates);

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

export function generateImproEnSeineIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const {
        intro: {
            duration,
        }
    } = args;

    const durationValue = getValue(duration);

    const intro = generateIntroOutro(durationValue, libraries);
    return intro;
}

export function generateImproEnSeineOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const {
        outro: {
            duration,
        }
    } = args;

    const durationValue = getValue(duration);

    const outro = generateIntroOutro(durationValue, libraries);
    return outro;
}
