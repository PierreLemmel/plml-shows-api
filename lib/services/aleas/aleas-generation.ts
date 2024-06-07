import { Timestamp } from "firebase/firestore";
import { Key } from "react";
import { randomRange } from "../core/utils";
import { DmxValueSegment } from "../dmx/showControl";

export type RangeOrValue = number | [ number, number ];

export type FadeProps = { fade: RangeOrValue } | { fadeIn: RangeOrValue, fadeOut: RangeOrValue };

export type KeyFrame = [ number, number ];

export type GenerateAleasShowArgs = {
    show: {
        totalDuration: RangeOrValue;
        lightingPlan: string;
        blackoutDuration: RangeOrValue;
    },
    preshow: {
        scene: string;
    } & FadeProps,
    postshow: {
        scene: string;
    } & FadeProps,
    intro: {
        duration: RangeOrValue;
        scene: string;
    } & FadeProps,
    features: {
        projections: boolean,
        monologues: boolean,
        confessionnal: boolean,
        stroboscope: boolean,
    }
}

export type GenerationInfo = {
    generatedAt: Timestamp;
    params: GenerateAleasShowArgs;
}

export type AleasShowScene = {
    name: string;
    duration: number;
    info: string;
} & ({
    hasLights: true,
    lights: {
        scene: string;
        amplitude: number;
        level: KeyFrame[];
        elements: DmxValueSegment[];
    }[],
} | { hasLights: false })
& ({
    hasAudio: true,
    audio: {
        track: string;
        startTime: number;
        duration: number;
        amplitude: number;
        volume: KeyFrame[];
    }[]
} | { hasAudio: false })
& ({
    hasProjections: true,
    projections: {
        text: string;
        startTime: number;
        duration: number;
        fadeIn: number;
        fadeOut: number;
    }[]
} | { hasProjections: false })

export type AleasShow = {
    generationInfo: GenerationInfo;
    preshow: {
        
    },
    postshow: {
        
    },
    scenes: AleasShowScene[];
};

export const getValue = (value: RangeOrValue): number => (Array.isArray(value)) ? randomRange(value[0], value[1]) : value

export const getFadeValues = (fade: FadeProps): { fadeIn: number, fadeOut: number } => {
    if ("fade" in fade) {
        return {
            fadeIn: getValue(fade.fade),
            fadeOut: getValue(fade.fade)
        }
    }
    else {
        return {
            fadeIn: getValue(fade.fadeIn),
            fadeOut: getValue(fade.fadeOut)
        }
    }
}

export function generateAleasShow(args: GenerateAleasShowArgs): AleasShow {

    return {
        generationInfo: {
            generatedAt: Timestamp.now(),
            params: args
        },
        scenes: [
            {
                name: "Scene-01",
                duration: 58.2,
                info: "Test scene with projections, audio and lights",
                hasLights: true,
                lights: [
                    {
                        scene: "testDmxScene",
                        amplitude: 1.0,
                        level: [
                            [0.0, 0.0],
                            [4.2, 1.0],
                            [54.0, 1.0],
                            [58.2, 0.0]
                        ],
                        elements: [
                            {
                                address: 1,
                                values: [255, 0, 255, 0, 255, 0]
                            },
                            {
                                address: 7,
                                values: [0, 255, 255, 0, 255, 0]
                            },
                            {
                                address: 13,
                                values: [50]
                            },
                            {
                                address: 14,
                                values: [50]
                            },
                            {
                                address: 15,
                                values: [50]
                            },
                            {
                                address: 16,
                                values: [50]
                            },
                        ]
                    },
                ],
                hasAudio: true,
                audio: [
                    {
                        track: "beat1",
                        startTime: 12.0,
                        duration: 30.0,
                        amplitude: 0.85,
                        volume: [
                            [ 0.0, 0.0 ],
                            [ 4.5, 0.7 ],
                            [ 12, 0.7 ],
                            [ 13.5, 1.0 ],
                            [ 20.3, 1.0 ],
                            [ 22.0, 0.3 ],
                            [ 28.0, 0.3 ],
                            [ 30.0, 0.0 ]
                        ]
                    }
                ],
                hasProjections: true,
                projections: [
                    {
                        text: "Salut",
                        startTime: 12.0,
                        duration: 4.0,
                        fadeIn: 0.5,
                        fadeOut: 0.5,
                    },
                    {
                        text: "Ca va ?",
                        startTime: 16.2,
                        duration: 4.0,
                        fadeIn: 0.5,
                        fadeOut: 0.5,
                    },
                    {
                        text: "Tu passes une bonne journée ?",
                        startTime: 20.4,
                        duration: 6.0,
                        fadeIn: 0.5,
                        fadeOut: 0.5,
                    }
                ]
            },
            {
                name: "Scene-02",
                duration: 121.2,
                info: "Test scene with only lights",
                hasLights: true,
                lights: [
                    {
                        scene: "testDmxScene 2",
                        amplitude: 1.0,
                        level: [
                            [0.0, 0.0],
                            [2.1, 1.0],
                            [119.1, 1.0],
                            [121.2, 0.0]
                        ],
                        elements: [
                            {
                                address: 13,
                                values: [255]
                            },
                            {
                                address: 14,
                                values: [255]
                            },
                            {
                                address: 15,
                                values: [255]
                            },
                            {
                                address: 16,
                                values: [255]
                            },
                        ]
                    },
                ],
                hasAudio: false,
                hasProjections: false,
            },
            {
                name: "Scene-03",
                duration: 605,
                info: "Long test scene with lights and audio",
                hasLights: true,
                lights: [
                    {
                        scene: "testDmxScene 2",
                        amplitude: 1.0,
                        level: [
                            [0.0, 0.0],
                            [2.1, 1.0],
                            [602.9, 1.0],
                            [605, 0.0]
                        ],
                        elements: [
                            {
                                address: 13,
                                values: [255]
                            },
                            {
                                address: 14,
                                values: [255]
                            },
                            {
                                address: 15,
                                values: [255]
                            },
                            {
                                address: 16,
                                values: [255]
                            },
                            {
                                address: 17,
                                values: [255]
                            },
                            {
                                address: 18,
                                values: [255]
                            },
                            {
                                address: 19,
                                values: [255]
                            },
                            {
                                address: 20,
                                values: [255]
                            }
                        ]
                    },
                ],
                hasAudio: true,
                audio: [
                    {
                        track: "acid-meltdown",
                        startTime: 100.0,
                        duration: 20.0,
                        amplitude: 1.0,
                        volume: [
                            [ 0.0, 0.0 ],
                            [ 2.0, 1.0 ],
                            [ 18.0, 1.0 ],
                            [ 20.0, 0.0 ],
                        ]
                    },
                    {
                        track: "acid-meltdown",
                        startTime: 200.0,
                        duration: 20.0,
                        amplitude: 1.0,
                        volume: [
                            [ 0.0, 0.0 ],
                            [ 2.0, 1.0 ],
                            [ 18.0, 1.0 ],
                            [ 20.0, 0.0 ],
                        ]
                    },
                    {
                        track: "acid-meltdown",
                        startTime: 300.0,
                        duration: 20.0,
                        amplitude: 1.0,
                        volume: [
                            [ 0.0, 0.0 ],
                            [ 2.0, 1.0 ],
                            [ 18.0, 1.0 ],
                            [ 20.0, 0.0 ],
                        ]
                    },
                ],
                hasProjections: false,
            }
        ],
        preshow: {},
        postshow: {},
    }
}