import { progress } from "framer-motion";
import { flattenArray, shuffleArray } from "../../core/arrays";
import { randomElement, randomInt, randomRange, sequence } from "../../core/utils";
import { CalculateParamValArgs, GenerateAleasPreShowArgs, LoadedLibraries, StartAndDuration, Range, makeSceneProvider, AleasSceneTemplate, GenerateAleasPostShowArgs, AleasShowStaticElements, SceneBaseInfo, LightsElementsOrNoLights, AudioElementsOrNoAudio, KeyFrame, LightsElement, SceneData, GenerateAleasShowArgs, getValue, AleasShowScene, GenerateAleasIntroOutroArgs, getFadeValues, ProjectionsElementsOrNoProjections } from "../aleas-generation";
import { ScenesGroup, StepsContainerGroup, createStandardLevel, generateAudioElements, generateIntermittentIntervals, generatePeriodicEvent, generateRandomDurations, getRandomDuration, getRandomElementFromAudioLib, getRandomProjectionInput, getRandomSceneFromScenes, getRandomStepsContainerFromGroup, getValuesFromScene, getWholeRangeAmplitude } from "../aleas-generation-utils";

export const auCoinDeLaLune = {
    templates: {
        "simple-standard-duration": function(libraries: LoadedLibraries): AleasSceneTemplate {
            
            const templateName = "simple-standard-duration";
            const templateInfo = "Simple scene with basic lights and standard duration";

            const availableDurations = [
                auCoinDeLaLune.durations.short,
                auCoinDeLaLune.durations.standard,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: ScenesGroup = [
                auCoinDeLaLune.scenes.standardScenes,
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
        
                const fadeIn = randomRange(2, 6);
                const fadeOut = randomRange(2, 6);
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
                weight: 8,
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
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong,
                auCoinDeLaLune.durations.long
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: ScenesGroup = [
                auCoinDeLaLune.scenes.standardScenes,
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
                weight: 12,
                requiredFeatures: [],
                value: makeSceneProvider({
                    getBaseInfo,
                    getLights,
                    getAudio
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
            const confessionnalScene = auCoinDeLaLune.scenes.confessionnal;

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


                    return occurences < confessionnalsCount && (
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
                    getLights,
                }, libraries),
                durationRange
            }
        },
        "ambient": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "ambient";
            const templateInfo = "Ambient";

            const availableDurations = [
                auCoinDeLaLune.durations.short,
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong,
                auCoinDeLaLune.durations.long,
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                auCoinDeLaLune.scenes.ambients.fullColor,
                auCoinDeLaLune.scenes.ambients.bicolor,
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
                const ambientAmplitude = randomRange(0.4, 0.7);
                const blackoutOffset = 3;
                const fadeIn = randomRange(2, 5);
                const fadeOut = randomRange(2, 5);

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

                return {
                    hasLights: true,
                    lights: [
                        ambientElement,
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
                        occurences
                    } = args;

                    const penalty = 10;

                    const base = 20;
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
                    getAudio,
                }, libraries),
                durationRange
            }
        },
        "ambient-with-smoke": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "ambient-with-smoke";
            const templateInfo = "Ambient with smoke";


            const availableDurations = [
                auCoinDeLaLune.durations.short,
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong,
                auCoinDeLaLune.durations.long,
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const ambientScenes = [
                auCoinDeLaLune.scenes.ambients.fullColor,
                auCoinDeLaLune.scenes.ambients.bicolor,
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
                
                const ambientAmplitude = randomRange(0.4, 0.7);
                const blackoutOffset = 3;
                const fadeIn = randomRange(2, 5);
                const fadeOut = randomRange(2, 5);

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

                const smokeScene = auCoinDeLaLune.scenes.smoke;
                const smokeDuration = 2.1;
                const smokeFade = 0.1;
                const smokeInterval = 150;

                let smokeTime = 0;
                const smokeKeyFrames: KeyFrame[] = [];
                const smokeOffsetToEnd = 30;
                while (smokeTime < duration - smokeOffsetToEnd) {                    
                    const smokeFrames = createStandardLevel({
                        duration: smokeDuration,
                        fadeIn: smokeFade,
                        fadeOut: smokeFade,
                        offset: smokeTime
                    })
                    smokeKeyFrames.push(...smokeFrames);

                    smokeTime += smokeInterval;
                }

                const smokeElement: LightsElement = {
                    scene: smokeScene,
                    amplitude: 1,
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
                        occurences
                    } = args;

                    return progress > 0.47 && occurences < 2;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 10;

                    const base = 20;
                    const slope = 50;

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
        },
        "ultra-short": function(libraries: LoadedLibraries): AleasSceneTemplate {

            const templateName = "ultra-short";
            const templateInfo = "Scene with ultra short duration";
            
            const availableDurations = [
                auCoinDeLaLune.durations.ultraShort
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);
            
            const availableScenes: ScenesGroup = [
                auCoinDeLaLune.scenes.standardScenes,
                auCoinDeLaLune.scenes.crudes,
                auCoinDeLaLune.scenes.ambients.fullColor,
                auCoinDeLaLune.scenes.ambients.bicolor,
                auCoinDeLaLune.scenes.isolations
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
                        occurences,
                        progress
                    } = args;

                    return progress > 0.1
                        && progress < 0.9
                        && occurences < 4;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 8;

                    const base = 15;
                    const slope = 50;

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
        "crudes": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "crudes";
            const templateInfo = "Crude scenes";

            const availableDurations = [
                auCoinDeLaLune.durations.short,
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: ScenesGroup = [
                auCoinDeLaLune.scenes.crudes
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
                enabled: true,
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 5;

                    const base = 20;
                    const slope = 15;

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
                auCoinDeLaLune.durations.short,
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong,
                auCoinDeLaLune.durations.long
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const stepRangeSeed = [6, 10];
            const minMidDuration = 8;
            
            const availableScenes: StepsContainerGroup = [
                auCoinDeLaLune.scenes.crudesAlternates
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
        
                const fade = randomRange(1.5, 3.5);
                const amplitude = randomRange(0.7, 1.0);


                const scenes = getRandomStepsContainerFromGroup(availableScenes);

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
                        occurences
                    } = args;

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
        "isolations": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "isolations";
            const templateInfo = "Isolations scenes";

            const availableDurations = [
                auCoinDeLaLune.durations.short,
                auCoinDeLaLune.durations.standard,
            ];

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: ScenesGroup = [
                auCoinDeLaLune.scenes.isolations
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

                const audioOdds = 0.5;

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
                    

                    return progress > 0.12;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 5;

                    const base = 10;
                    const slope = 15;

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
        "isolations-alternates": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "isolations-alternates";
            const templateInfo = "Isolations - Alternate";

            const availableDurations = [
                auCoinDeLaLune.durations.short,
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const stepRangeSeed = [6, 10];
            const minMidDuration = 8;
            
            const availableScenes: StepsContainerGroup = [
                auCoinDeLaLune.scenes.crudesAlternates
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


                const scenes = getRandomStepsContainerFromGroup(availableScenes);

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
                        occurences
                    } = args;

                    const penalty = 50;

                    const base = 0;
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
        "pf-bascule-ambient": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "pf-bascule-ambient";
            const templateInfo = "Plein Feux - Bascule - Ambient";

            const basculeRange: Range = [15, 37];

            const availableDurations = [
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong,
                auCoinDeLaLune.durations.long
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const standardScenes = [
                auCoinDeLaLune.scenes.standardScenes
            ]

            const ambientScenes = [
                auCoinDeLaLune.scenes.ambients.fullColor,
                auCoinDeLaLune.scenes.ambients.bicolor,
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

                const pfScene = getRandomSceneFromScenes(standardScenes);
                const ambientScene = getRandomSceneFromScenes(ambientScenes);

                const pfKeyFrames: KeyFrame[] = [];
                const ambientKeyFrames: KeyFrame[] = [];

                pfKeyFrames.push(
                    [0, 0],
                    [fadeToPF, 1],
                )

                ambientKeyFrames.push(
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

                return {
                    hasLights: true,
                    lights: [
                        pfElement,
                        ambientElement,
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
                        occurences
                    } = args;

                    const penalty = 10;

                    const base = 20;
                    const slope = 30;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: [],
                value: makeSceneProvider<PfBasculeAmbientMoreArgs>({
                    getBaseInfo,
                    getLights,
                    getAudio,
                    getMoreArgs
                }, libraries),
                durationRange
            }
        },
        "pf-bascule-ambient-strobes": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "pf-bascule-ambient-strobes";
            const templateInfo = "Plein Feux - Bascule - Ambient with strobes";

            const basculeRange: Range = [8, 12];

            const availableDurations = [
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong,
                auCoinDeLaLune.durations.long
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const standardScenes = [
                auCoinDeLaLune.scenes.standardScenes
            ]

            const ambientScenes = [
                auCoinDeLaLune.scenes.ambients.fullColor,
                auCoinDeLaLune.scenes.ambients.bicolor,
            ];

            const strobeScenes = [
                auCoinDeLaLune.scenes.strobes
            ]

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
                    occurencesCap: 5
                });

                const fadeToAmbient = randomRange(0.8, 1.6);
                const fadeToPF = randomRange(1.5, 3);

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
                const strobesAmplitude = randomRange(0.65, 0.85);
                const blackoutFade = randomRange(2.0, 5.0);

                const pfScene = getRandomSceneFromScenes(standardScenes);
                const ambientScene = getRandomSceneFromScenes(ambientScenes);
                const strobeScene = getRandomSceneFromScenes(strobeScenes);

                const pfKeyFrames: KeyFrame[] = [];
                const ambientKeyFrames: KeyFrame[] = [];
                const strobeKeyFrames: KeyFrame[] = [];

                pfKeyFrames.push(
                    [0, 0],
                    [fadeToPF, 1],
                )

                ambientKeyFrames.push(
                    [0, 0],
                )

                strobeKeyFrames.push(
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

                    strobeKeyFrames.push(
                        [startTime, 0],
                        [startTime + 0.1, 1],
                        [startTime + eltDuration - 0.1, 1],
                        [startTime + eltDuration, 0]
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

                const strobesElement: LightsElement = {
                    scene: strobeScene,
                    amplitude: strobesAmplitude,
                    level: strobeKeyFrames,
                    elements: getValuesFromScene(libraries.dmxScenes, strobeScene)
                }

                return {
                    hasLights: true,
                    lights: [
                        pfElement,
                        ambientElement,
                        strobesElement,
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
                        occurences
                    } = args;

                    return progress > 0.55
                        && occurences < 1;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 30;

                    const base = 25;
                    const slope = 60;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: ["stroboscopes"],
                value: makeSceneProvider<PfBasculeAmbientMoreArgs>({
                    getBaseInfo,
                    getLights,
                    getAudio,
                    getMoreArgs
                }, libraries),
                durationRange
            }
        },
        "pf-bascule-ambient-strobes-smoke": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "pf-bascule-ambient-strobes-smoke";
            const templateInfo = "Plein Feux - Bascule - Ambient with strobes and smoke";

            const basculeRange: Range = [12, 22];

            const availableDurations = [
                auCoinDeLaLune.durations.standard,
                auCoinDeLaLune.durations.standardLong,
                auCoinDeLaLune.durations.long
            ];
            const durationRange = getWholeRangeAmplitude(...availableDurations);

            const standardScenes = [
                auCoinDeLaLune.scenes.standardScenes
            ]

            const ambientScenes = [
                auCoinDeLaLune.scenes.ambients.fullColor,
                auCoinDeLaLune.scenes.ambients.bicolor,
            ];

            const strobeScenes = [
                auCoinDeLaLune.scenes.strobes
            ]

            const smokeScene = auCoinDeLaLune.scenes.smoke;
            const smokeDuration = 2.5;
            const smokeInterval = 150;

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
                    occurencesCap: 5
                });

                const fadeToAmbient = randomRange(0.8, 1.6);
                const fadeToPF = randomRange(1.5, 3);

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
                const strobesAmplitude = randomRange(0.65, 0.85);
                const blackoutFade = randomRange(2.0, 5.0);

                const pfScene = getRandomSceneFromScenes(standardScenes);
                const ambientScene = getRandomSceneFromScenes(ambientScenes);
                const strobeScene = getRandomSceneFromScenes(strobeScenes);

                const pfKeyFrames: KeyFrame[] = [];
                const ambientKeyFrames: KeyFrame[] = [];
                const strobeKeyFrames: KeyFrame[] = [];
                const smokeKeyFrames: KeyFrame[] = [];

                let smokeTime = bascules[0].startTime;
                const smokeOffsetToEnd = 30.0;
                while (smokeTime < duration - smokeOffsetToEnd) {
                    smokeKeyFrames.push([smokeTime, 0]);
                    smokeKeyFrames.push([smokeTime + 0.1, 1]);
                    smokeKeyFrames.push([smokeTime + smokeDuration - 0.1, 1]);
                    smokeKeyFrames.push([smokeTime + smokeDuration, 0]);

                    smokeTime += smokeInterval;
                }

                pfKeyFrames.push(
                    [0, 0],
                    [fadeToPF, 1],
                )

                ambientKeyFrames.push(
                    [0, 0],
                )

                strobeKeyFrames.push(
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

                    strobeKeyFrames.push(
                        [startTime, 0],
                        [startTime + 0.1, 1],
                        [startTime + eltDuration - 0.1, 1],
                        [startTime + eltDuration, 0]
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

                const strobesElement: LightsElement = {
                    scene: strobeScene,
                    amplitude: strobesAmplitude,
                    level: strobeKeyFrames,
                    elements: getValuesFromScene(libraries.dmxScenes, strobeScene)
                }

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
                        strobesElement,
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
                        occurences
                    } = args;

                    return progress > 0.65
                        && occurences < 1;
                },
                weight: (args: CalculateParamValArgs) => {
                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 30;

                    const base = 25;
                    const slope = 70;

                    return Math.max(
                        base + progress * slope - occurences * penalty,
                        0
                    );
                },
                requiredFeatures: ["stroboscopes", "smokeMachine"],
                value: makeSceneProvider<PfBasculeAmbientMoreArgs>({
                    getBaseInfo,
                    getLights,
                    getAudio,
                    getMoreArgs
                }, libraries),
                durationRange
            }
        },
        "projection-input": function(libraries: LoadedLibraries): AleasSceneTemplate {
            const templateName = "projection-input";
            const templateInfo = "Simple scene with a projection input";

            const availableDurations = [
                auCoinDeLaLune.durations.short,
                auCoinDeLaLune.durations.standard,
            ];

            const projectionDuration = 8;

            const durationRange = getWholeRangeAmplitude(...availableDurations);
            const availableScenes: string[][] = [
                auCoinDeLaLune.scenes.standardScenes,
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
                
                const normalLightElement: LightsElement = {
                    scene,
                    amplitude,
                    level,
                    elements: valueSegments
                }

                const shutterFade = 0.2;
                const shutterScene = auCoinDeLaLune.scenes.shutter;
                const shutterLightElement: LightsElement = {
                    scene: shutterScene,
                    elements: getValuesFromScene(libraries.dmxScenes, shutterScene),
                    level: createStandardLevel({
                        duration: projectionDuration,
                        fadeIn: shutterFade,
                        fadeOut: shutterFade
                    }),
                    amplitude: 1
                }

                return {
                    hasLights: true,
                    lights: [
                        normalLightElement,
                        shutterLightElement
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
                        occurences
                    } = args;

                    return progress > 0.40 && occurences < 3;
                },
                weight: (args: CalculateParamValArgs) => {

                    const {
                        progress,
                        occurences
                    } = args;

                    const penalty = 15;

                    const base = 50;
                    const slope = 12;

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
    } satisfies { [key: string]: (libraries: LoadedLibraries) => AleasSceneTemplate },
    scenes: {
        public: "public",
        static: "static",
        shutter: "shutter",
        introOutro: {
            base: "intro-outro-base",
            elements: [
                "intro-outro-01",
                "intro-outro-02",
                "intro-outro-03",
                "intro-outro-04",
            ]
        },
        confessionnal: "confessionnal",
        standardScenes: [
            "faces",
            "pf-chaud",
            "pf-with-blue",
            "pf-with-green"
        ] satisfies ScenesGroup,
        isolations: [
            "douche-jar",
            "douche-cour",
            "double-douches"
        ] satisfies ScenesGroup,
        isolationsAlternates: [
            [
                "douche-jar",
                "douche-cour"
            ]
        ] satisfies StepsContainerGroup,
        crudes: [
            "decoupe-centrale",
            "platine",
            "decoupe-diag",
            "platine-decoupe-diag",
            // "couloir-arr-ch",
            "couloir-av-fr",
        ] satisfies ScenesGroup,
        crudesAlternates: [
            [
                "platine",
                "decoupe-diag",
            ]
        ] satisfies StepsContainerGroup,
        ambients: {
            fullColor: [
                "full-rouge",
                "full-bleu",
                "full-emeraude",
                "full-amber",
                "full-purple"
            ] satisfies ScenesGroup,
            bicolor: [
                "bicolor-red-emeraude",
                "bicolor-purple-blue"
            ] satisfies ScenesGroup,
        },
        strobes: [
            "strobes-wash",
            "strobes-fond",
            "strobes-all",
        ] as ScenesGroup,
        smoke: "smoke",
    },
    durations: {
        ultraShort: [4, 10],
        short: [30, 70],
        standard: [70, 200],
        standardLong: [200, 350],
        long: [350, 500],
        ultraLong: [500, 900],
    } satisfies { [key: string]: Range }
};


export function getAuCoinDeLaLuneSceneTemplates(libraries: LoadedLibraries): AleasSceneTemplate[] {

    const factories: ((libraries: LoadedLibraries) => AleasSceneTemplate)[] = Object.values(auCoinDeLaLune.templates);

    const templates = factories.map(factory => factory(libraries));

    return templates;
};


export function getAuCoinDeLaLuneStaticElements(libraries: LoadedLibraries): AleasShowStaticElements {

    return {
        lights: {
            scene: "static",
            elements: getValuesFromScene(libraries.dmxScenes, "static")
        }
    }
}

export function getAuCoinDeLaLunePreshowElements(args: GenerateAleasPreShowArgs, libraries: LoadedLibraries): AleasShowScene[] {
    
    const {
        fade,
        elementDuration,
        elementCount,
        volume,
    } = args;

    const scenes: string[] = shuffleArray([
        ...auCoinDeLaLune.scenes.crudes,
        ...auCoinDeLaLune.scenes.ambients.bicolor,
        ...auCoinDeLaLune.scenes.ambients.fullColor,
    ]);
    const amplitudeRange = [0.6, 1.0];

    const audioLibs = ["aleas-general"];
    const tracksByLib = audioLibs.map(lib => sequence(libraries.audioLibraries[lib].count, 1).map(i => `${lib}-${i.toString().padStart(2, "0")}`));
    const tracks = shuffleArray(flattenArray(tracksByLib));

    const audioStartOffset = fade + 0.5;
    const audioTrackDuration = elementDuration - audioStartOffset;

    return sequence(elementCount, 1).map(i => {

        const name = `preshow-${i.toString().padStart(2, "0")}`;
        const sceneIndex = i % scenes.length;
        const trackIndex = i % tracks.length;

        const showScene: AleasShowScene = {
            info: `Preshow scene - ${i.toString().padStart(2, "0")}`,
            duration: elementDuration,
            templateName: "Preshow",
            name,
            displayName: name,
            hasAudio: true,
            audio: [
                {
                    volume: createStandardLevel({
                        duration: audioTrackDuration,
                        fadeIn: fade,
                        fadeOut: fade,
                    }),
                    startTime: audioStartOffset,
                    duration: elementDuration,
                    amplitude: volume,
                    track: tracks[trackIndex],
                }
            ],
            hasLights: true,
            lights: [
                {
                    scene: scenes[sceneIndex],
                    amplitude: randomRange(amplitudeRange[0], amplitudeRange[1]),
                    level: createStandardLevel({
                        duration: elementDuration,
                        fadeIn: fade,
                        fadeOut: fade,
                    }),
                    elements: getValuesFromScene(libraries.dmxScenes, scenes[sceneIndex])
                }
            ],
            hasProjections: false,
        }

        return showScene;
    });
}

export function getAuCoinDeLaLunePostshowElements(args: GenerateAleasPostShowArgs, libraries: LoadedLibraries): AleasShowScene[] {
    const {
        fade,
        elementDuration,
        elementCount,
        volume,
    } = args;

    const scenes: string[] = shuffleArray([
        ...auCoinDeLaLune.scenes.crudes,
        ...auCoinDeLaLune.scenes.ambients.bicolor,
        ...auCoinDeLaLune.scenes.ambients.fullColor,
    ]);
    const amplitudeRange = [0.6, 1.0];

    const audioLibs = ["aleas-general"];
    const tracksByLib = audioLibs.map(lib => sequence(libraries.audioLibraries[lib].count, 1).map(i => `${lib}-${i.toString().padStart(2, "0")}`));
    const tracks = shuffleArray(flattenArray(tracksByLib));

    const audioStartOffset = fade + 0.5;
    const audioTrackDuration = elementDuration - audioStartOffset;

    return sequence(elementCount, 1).map(i => {

        const name = `postshow-${i.toString().padStart(2, "0")}`;
        const sceneIndex = i % scenes.length;
        const trackIndex = i % tracks.length;

        const showScene: AleasShowScene = {
            info: `Postshow scene - ${i.toString().padStart(2, "0")}`,
            duration: elementDuration,
            templateName: "Postshow",
            name,
            displayName: name,
            hasAudio: true,
            audio: [
                {
                    volume: createStandardLevel({
                        duration: elementDuration,
                        fadeIn: fade,
                        fadeOut: fade,
                    }),
                    startTime: audioStartOffset,
                    duration: audioTrackDuration,
                    amplitude: volume,
                    track: tracks[trackIndex],
                }
            ],
            hasLights: true,
            lights: [
                {
                    scene: scenes[sceneIndex],
                    amplitude: randomRange(amplitudeRange[0], amplitudeRange[1]),
                    level: createStandardLevel({
                        duration: elementDuration,
                        fadeIn: fade,
                        fadeOut: fade,
                    }),
                    elements: getValuesFromScene(libraries.dmxScenes, scenes[sceneIndex])
                }
            ],
            hasProjections: false,
        }

        return showScene;
    });
}

type PostSceneData = {
    scene: string;
    duration: number;
    amplitude: number;
    fade: number;
    musicFade: number;
    musicDuration: number;
    musicVolume: number;
}

function generateIntroOutro(args: GenerateAleasIntroOutroArgs, libraries: LoadedLibraries, postScene?: PostSceneData): SceneData { 
    
    const {
        duration,
        fade,
        volume
    } = args;

    const durationValue = getValue(duration);
    const fadeValues = getFadeValues(fade);

    const blackoutOffset = 1.5;
    const startOffset = 7.4;

    const lightAmplitude = 1;
    
    const introBaseScene = auCoinDeLaLune.scenes.introOutro.base;
    const lightFade = randomRange(0.2, 0.4);

    const introBaseElement: LightsElement = {
        scene: introBaseScene,
        amplitude: lightAmplitude,
        level: createStandardLevel({
            duration: durationValue,
            fadeIn: fadeValues.fadeIn,
            fadeOut: fadeValues.fadeIn,
        }),
        elements: getValuesFromScene(libraries.dmxScenes, introBaseScene)
    }

    const introScenes = auCoinDeLaLune.scenes.introOutro.elements;

    const eltCount = introScenes.length;
    const lightKeyFrames: KeyFrame[][] = sequence(eltCount, 1)
        .map(i => [
            [0, 0],
            [startOffset, 0]
        ]);

    const durations = generateRandomDurations({
        totalDuration: durationValue - blackoutOffset - startOffset,
        range: [2, 5.5]
    })

    let trackIndex = randomInt(0, eltCount);
    let time = startOffset;
    durations.forEach((duration, i) => {
        lightKeyFrames[trackIndex].push(
            [time, 0],
            [time + lightFade, 1],
            [time + duration, 1],
            [time + duration + lightFade, 0]
        )

        const availableIndices = sequence(eltCount).filter(j => j !== trackIndex);
        const nextIndex = randomElement(availableIndices);
        trackIndex = nextIndex;

        time += duration;
    });

    lightKeyFrames.forEach(frames => frames.push(
        [durationValue - blackoutOffset + lightFade, 0],
        [durationValue, 0]
    ))

    const lightsElements = [
        introBaseElement,
        ...lightKeyFrames.map((keyFrames, i) => {
            const sceneName = `intro-outro-${(i + 1).toString().padStart(2, "0")}`;

            return {
                scene: sceneName,
                amplitude: lightAmplitude,
                level: keyFrames,
                elements: getValuesFromScene(libraries.dmxScenes, sceneName)
            }
        })
    ];

    const audioFadeIn = randomRange(0.5, 1.5);
    const audioFadeOut = randomRange(0.5, 1.5);

    let audioLevel: KeyFrame[];
    if (postScene) {
        const {
            musicFade: depresentationMusicFade,
            musicDuration: depresentationMusicDuration,
            musicVolume: depresentationMusicVolume
        } = postScene;

        audioLevel = [
            [0, 0],
            [audioFadeIn, volume],
            [durationValue - audioFadeOut, volume],
            [durationValue, depresentationMusicVolume],
            [durationValue + depresentationMusicDuration - depresentationMusicFade, depresentationMusicVolume],
            [durationValue + depresentationMusicDuration, 0],
        ]
    }
    else {
        audioLevel = createStandardLevel({
            duration: durationValue,
            fadeIn: audioFadeIn,
            fadeOut: audioFadeOut,
            level: volume
        });    
    }

    

    const finalDuration = durationValue + (postScene?.duration ?? 0);
    const finalAudioDuration = durationValue + (postScene?.musicDuration ?? 0);
    if (postScene) {

        const postSceneElement: LightsElement = {
            scene: postScene.scene,
            amplitude: postScene.amplitude,
            level: createStandardLevel({
                offset: durationValue + blackoutOffset,
                duration: postScene.duration,
                fadeIn: postScene.fade,
                fadeOut: postScene.fade,
            }),
            elements: getValuesFromScene(libraries.dmxScenes, postScene.scene)
        }

        lightsElements.push(postSceneElement);
    }

    return {
        templateName: "intro",
        duration: finalDuration,
        info: "Intro scene",
        hasLights: true,
        lights: lightsElements,
        hasAudio: true,
        audio: [
            {
                track: "intro-01",
                startTime: 0,
                duration: finalAudioDuration,
                amplitude: 1.0,
                volume: audioLevel
            }
        ],
        hasProjections: false
    }
}

export function generateAuCoinDeLaLuneIntroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    const intro = generateIntroOutro(args.intro, libraries);
    return intro;
}

export function generateAuCoinDeLaLuneOutroScene(args: GenerateAleasShowArgs, libraries: LoadedLibraries): SceneData {
    
    const { depresentation } = args.outro;

    const postScene: PostSceneData|undefined = depresentation.hasDepresentation ? 
        ({ ...depresentation }) : 
        undefined;

    const outro = generateIntroOutro(args.outro, libraries, postScene);
    return outro;
}
