import { AleasContentScene } from "../aleas-generation";

export const hardCodedTheatreDuTempsLibrary: AleasContentScene[] = [
    // Preshow
    {
        name: "preshow",
        projectIndex: 3,
        description: "Preshow",
        tags: [ "preshow"],
        fades: [
            {
                elements: [ "Title" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Projections" ],
                relativeOffset: 0.2,
            },
            {
                elements: [ "Pulses" ],
                relativeOffset: 0.6
            },
            {
                elements: [ "Alcove" ],
                relativeOffset: 1.0
            },
            {
                elements: [ "Services" ],
                relativeOffset: 1.6
            }
        ]
    },
    // Postshow
    {
        name: "postshow",
        projectIndex: 4,
        description: "Postshow",
        tags: [ "postshow"],
        fades: [
            {
                elements: [ "Title" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Projections" ],
                relativeOffset: 0.2,
            },
            {
                elements: [ "Pulses" ],
                relativeOffset: 0.6
            },
            {
                elements: [ "Alcove" ],
                relativeOffset: 1.0
            },
            {
                elements: [ "Services" ],
                relativeOffset: 1.6
            }
        ]
    },
    // Intro
    {
        name: "intro",
        projectIndex: 5,
        description: "Intro",
        tags: [ "intro" ],
        steps: [
            {
                name: "intro-01",
                elements: [ "Douche Jar" ]
            },
            {
                name: "Intro-02",
                elements: [ "Douche Cour" ]
            },
            {
                name: "Intro-03",
                elements: [ "Découpe centrale" ]
            },
            {
                name: "Intro-04",
                elements: [ "Alcove" ]
            }
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ]
    },
    // Outro
    {
        name: "outro",
        projectIndex: 6,
        description: "Outro",
        tags: [ "outr" ],
        steps: [
            {
                name: "intro-01",
                elements: [ "Douche Jar" ]
            },
            {
                name: "Intro-02",
                elements: [ "Douche Cour" ]
            },
            {
                name: "Intro-03",
                elements: [ "Découpe centrale" ]
            },
            {
                name: "Intro-04",
                elements: [ "Alcove" ]
            },
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ]
    },
    // Confessionnal
    {
        name: "confessionnal",
        projectIndex: 7,
        description: "Confessionnal",
        tags: [ "confessionnal"],
        fades: [
            {
                elements: [
                    "Timer projection",
                ],
                relativeOffset: 0,
            },
            {
                elements: [
                    "Alcove",
                ],
                relativeOffset: 0.08,
            },
        ],
        params: [
            {
                name: "duration",
                type: "float"
            }
        ]
    },
    // PF - Chaud
    {
        name: "pf-chaud",
        projectIndex: 8,
        description: "Pleins feux - Chaud",
        tags: [
            "standard",
            "pleins-feux"
        ],
        fades: [
            {
                elements: [ "contres" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "lats" ],
                relativeOffset: 0.15,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.35
            }
        ]
    },
    // PF - Froid
    {
        name: "pf-froid",
        projectIndex: 9,
        description: "Pleins feux - Froid",
        tags: [
            "standard",
            "pleins-feux"
        ],
        fades: [
            {
                elements: [ "contres" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "lats" ],
                relativeOffset: 0.15,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.35
            }
        ]
    },
    // Full Color
    {
        name: "full-color",
        projectIndex: 10,
        description: "Full Color",
        tags: [
            "color",
            "ambient"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.35,
            }
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.4, 1.0 ],
                valueRange: [ 0.75, 1.0 ]
            }
        ]
    },
    // Bicolor
    {
        name: "bicolor",
        projectIndex: 11,
        description: "Bicolor",
        tags: [
            "color",
            "ambient"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.35,
            }
        ],
        params: [
            {
                name: "color-contres",
                type: "color",
                saturationRange: [ 0.4, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            },
            {
                name: "color-lats",
                type: "color",
                link: {
                    to: "color-contres",
                    hueRotation: [1/2, 1/3, 2/3],
                },
            }
        ]
    },
    // Tricolor
    {
        name: "tricolor",
        projectIndex: 12,
        description: "Tricolor",
        tags: [
            "color",
            "ambient"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.35,
            }
        ],
        params: [
            {
                name: "color-contres",
                type: "color",
                saturationRange: [ 0.55, 1.0 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "color-jar",
                type: "color",
                link: {
                    to: "color-contres",
                    hueRotation: 1/3,
                }
            },
            {
                name: "color-cour",
                type: "color",
                link: {
                    to: "color-contres",
                    hueRotation: 2/3,
                }
            },
        ]
    },
    // Douche Jar
    {
        name: "douche-jar",
        projectIndex: 13,
        description: "Douche - Jardin",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Face" ],
                relativeOffset: 0.25,
            }
        ]
    },
    // Douche Cour
    {
        name: "douche-cour",
        projectIndex: 14,
        description: "Douche - Cour",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Face" ],
                relativeOffset: 0.25,
            }
        ]
    },
    // Doubles Douches
    {
        name: "double-douches",
        projectIndex: 15,
        description: "Double douches",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Face" ],
                relativeOffset: 0.25,
            }
        ]
    },
    // Decoupe centrale
    {
        name: "decoupe-centrale",
        projectIndex: 16,
        description: "Découpe centrale",
        tags: [
            "decoupe",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Découpe" ],
                relativeOffset: 0.,
            },
        ]
    },
    // White rotation
    {
        name: "white-rotation",
        projectIndex: 17,
        description: "White rotation",
        tags: [
            "special",
            "loud",
            "intense"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }, 
        ],
        params: [
            {
                name: "reverse",
                type: "bool",
            },
            {
                name: "speed",
                type: "float",
            },
            {
                name: "width",
                type: "float",
            },
            {
                name: "min-color",
                type: "color",
                valueRange: [ 0.0, 0.23 ],
                saturationRange: [ 0.0, 0.0 ]
            },
            {
                name: "max-color",
                type: "color",
                valueRange: [ 0.85, 1.0 ],
                saturationRange: [ 0.0, 0.0 ]
            },
        ]
    },
    // Douches Alternates
    {
        name: "douches-alternate",
        projectIndex: 18,
        description: "Douches alternées",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Face" ],
                relativeOffset: 0.25,
            }
        ],
        steps: [
            {
                name: "douche-01",
                elements: [ "Douche Jar" ]
            },
            {
                name: "douche-02",
                elements: [ "Douche Cour" ]
            }
        ]
    },
    // PF Chaud - Bascule Couleur
    {
        name: "pf-ch-basc-col",
        projectIndex: 19,
        description: "PF Chaud - Bascule Couleur",
        tags: [
            "bascule",
            "bascule-pf"
        ],
        fades: [
            {
                elements: [
                    "colors",
                    "contres",
                    "lats"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.25,
            },
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            }
        ],
        steps: [
            {
                name: "pf",
                elements: [
                    "Faces",
                    "Contres",
                    "Lats"
                ]
            },
            {
                name: "color",
                elements: [ "Colors" ],
            }
        ]
    },
    // PF Froid - Bascule Couleur
    {
        name: "pf-fr-basc-col",
        projectIndex: 20,
        description: "PF Froid - Bascule Couleur",
        tags: [
            "bascule",
            "bascule-pf"
        ],
        fades: [
            {
                elements: [
                    "colors",
                    "contres",
                    "lats"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.25,
            },
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            }
        ],
        steps: [
            {
                name: "pf",
                elements: [
                    "Faces",
                    "Contres",
                    "Lats"
                ]
            },
            {
                name: "color",
                elements: [ "Colors" ]
            }
        ]
    },
    // Color swap x2
    {
        name: "col-swap-2",
        projectIndex: 21,
        description: "Color swap x2",
        tags: [
            "color",
            "ambient-swap"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.22,
            }
        ],
        params: [
            {
                name: "color-1",
                type: "color",
                saturationRange: [ 0.5, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            },
            {
                name: "color-2",
                type: "color",
                link:{
                    to: "color-1",
                    hueRotation: [1/2, 1/3, 2/3]
                }
            },
        ],
        steps: [
            {
                name: "color-01",
                elements: [ "Colors" ]
            },
            {
                name: "color-02",
                elements: [ "Colors" ]
            },
        ]
    },
    // Color swap x3
    {
        name: "col-swap-3",
        projectIndex: 22,
        description: "Color swap x3",
        tags: [
            "color",
            "ambient-swap"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "color-1",
                type: "color",
                saturationRange: [ 0.55, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            },
            {
                name: "color-2",
                type: "color",
                link:{
                    to: "color-1",
                    hueRotation: 1/3,
                }
            },
            {
                name: "color-3",
                type: "color",
                link:{
                    to: "color-1",
                    hueRotation: 2/3,
                }
            },
        ],
        steps: [
            {
                "name": "color-01",
                "elements": [ "Colors" ]
            },
            {
                "name": "color-02",
                "elements": [ "Colors" ]
            },
            {
                "name": "color-03",
                "elements": [ "Colors" ]
            }
        ]
    },
    // Color Bascule Decoupe
    {
        name: "col-basc-decoupe",
        projectIndex: 23,
        description: "Color Bascule Decoupe",
        tags: [
            "color",
            "bascule",
            "bascule-col"
        ],
        fades: [
            {
                elements: [
                    "Colors",
                    "Découpe"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            },
        ],
        steps: [
            {
                name: "color",
                elements: [ "Colors" ]
            },
            {
                name: "decoupe",
                elements: [ "Découpe" ]
            }
        ]
    },
    // Color wave
    {
        name: "color-wave",
        projectIndex: 24,
        description: "Color Wave",
        tags: [
            "special",
            "ambient"
        ],
        fades: [
            {
                elements: [ "Colors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "front-color",
                type: "color",
                saturationRange: [ 0.9, 1.0 ],
                valueRange: [ 0.6, 0.8 ]
            },
            {
                name: "back-color",
                type: "color",
                link: {
                    to: "front-color",
                    hueRotation: [1/2, 1/3, 2/3],
                    saturationOffset: [-0.4, -0.15],
                    valueOffset: [-0.2, 0.2]
                }
            },
            {
                name: "effect-size",
                type: "float",
            },
            {
                name: "effect-speed",
                type: "float"
            }
        ]
    },
    // PF Chaud - Bascule Stroboscopes
    {
        name: "pf-ch-basc-str",
        projectIndex: 25,
        description: "PF Chaud - Bascule Stroboscopes",
        tags: [
            "bascule",
            "bascule-pf",
            "strobes",
            "loud"
        ],
        fades: [
            {
                elements: [
                    "colors",
                    "contres",
                    "lats"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "faces" ],
                relativeOffset: 0.25,
            }
        ],
        params: [
            {
                name: "strobes-color",
                type: "color",
                saturationRange: [ 0.7, 1.0 ],
                valueRange: [ 0.7, 1.0 ]
            },
            {
                name: "strobes-speed",
                type: "float",
            },
        ],
        steps: [
            {
                name: "pf",
                elements: [ "Plein feux" ]
            },
            {
                name: "strobes",
                elements: [ "strobes" ]
            }
        ]
    },
    // Projection - Input
    {
        name: "proj-input",
        projectIndex: 26,
        tags: [
            "projection",
        ],
        description: "Projection - Input",
        fades: [
            {
                elements: [
                    "contres",
                    "lats",
                    "lats-led"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
    },
    // Rectangle Doors
    {
        name: "rectangle-doors",
        projectIndex: 28,
        description: "Rectangle Doors",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Doors" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.30,
            }
        ],
        params: [
            {
                name: "background-color",
                type: "color",
                saturationRange: [ 0.0, 0.1 ],
                valueRange: [ 0.0, 0.1 ]
            },
            {
                name: "color1",
                type: "color",
                saturationRange: [ 0.0, 0.22 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "color2",
                type: "color",
                link: {
                    to: "color1",
                    hueRotation: [0, 1/2]
                }
            },
            {
                name: "x1",
                type: "float",
                range: [0.1, 0.4]
            },
            {
                name: "y1",
                type: "float",
                value: 0.0
            },
            {
                name: "w1",
                type: "float",
            },
            {
                name: "h1",
                type: "float",
            },
            {
                name: "x2",
                type: "float",
                range: [0.6, 0.9]
            },
            {
                name: "y2",
                type: "float",
                value: 0.0
            },
            {
                name: "w2",
                type: "float",
            },
            {
                name: "h2",
                type: "float",
            },
        ]
    },
    // Line Swipe
    {
        name: "line-swipe",
        projectIndex: 29,
        description: "Line Swipe",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Background" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Line" ],
                relativeOffset: 0.30,
            }
        ],
        params: [
            {
                name: "background-color",
                type: "color",
                saturationRange: [ 0.0, 0.1 ],
                valueRange: [ 0.0, 0.1 ]
            },
            {
                name: "line-color",
                type: "color",
                saturationRange: [ 0.0, 0.22 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "line-width",
                type: "float",
            },
            {
                name: "line-speed",
                type: "float",
            },
            {
                name: "line-period",
                type: "float",
            },
            {
                name: "left-to-right",
                type: "bool",
            },
            {
                name: "front-gradient",
                type: "float",
            },
            {
                name: "back-gradient",
                type: "float",
            }
        ]
    },
    // Face Line
    {
        name: "face-line",
        projectIndex: 30,
        description: "Face Line",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Line" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.3,
            }
        ],
        params: [
            {
                name: "background-color",
                type: "color",
                saturationRange: [ 0.0, 0.1 ],
                valueRange: [ 0.0, 0.1 ]
            },
            {
                name: "line-color",
                type: "color",
                saturationRange: [ 0.0, 1.0 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "h",
                type: "float",
            },
            {
                name: "line-width",
                type: "float",
            },
            {
                name: "rotation",
                type: "float",
            },
            {
                name: "upper-gradient",
                type: "float",
            },
            {
                name: "lower-gradient",
                type: "float",
            }
        ]
    },
    // Double Face Line
    {
        name: "double-face-line",
        projectIndex: 31,
        description: "Double Face Line",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Lines" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.3,
            }
        ],
        params: [
            {
                name: "background-color",
                type: "color",
                saturationRange: [ 0.0, 0.1 ],
                valueRange: [ 0.0, 0.1 ]
            },
            {
                name: "color1",
                type: "color",
                saturationRange: [ 0.0, 1.0 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "color2",
                type: "color",
                link: {
                    to: "color1",
                }
            },
            {
                name: "h1",
                type: "float",
            },
            {
                name: "h2",
                type: "float",
            },
            {
                name: "line-width",
                type: "float",
            },
            {
                name: "rotation1",
                type: "float",
            },
            {
                name: "rotation2",
                type: "float",
            },
            {
                name: "upper-gradient",
                type: "float",
            },
            {
                name: "lower-gradient",
                type: "float",
            }
        ]
    },
    // Circle Pulse
    {
        name: "circle-pulse",
        description: "Circle Pulse",
        projectIndex: 32,
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [ "Circle" ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.6,
            }
        ],
        params: [
            {
                name: "background-color",
                type: "color",
                saturationRange: [ 0.0, 0.1 ],
                valueRange: [ 0.0, 0.1 ]
            },
            {
                name: "circle-color",
                type: "color",
                saturationRange: [ 0.0, 0.22 ],
                valueRange: [ 0.85, 1.0 ]
            },
            {
                name: "min-radius",
                type: "float",
            },
            {
                name: "pulse-range",
                type: "float",
            },
            {
                name: "pulse-speed",
                type: "float",
            },
            {
                name: "height",
                type: "float",
            },
            {
                name: "feathering",
                type: "float",
            }
        ]
    },
    // Clouds
    {
        name: "clouds",
        description: "Clouds",
        projectIndex: 33,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "scale",
                type: "float",
            },
            {
                name: "color",
                type: "color",
                valueRange: [ 0.95, 1.0 ]
            },
        ]
    },
    // Glowing Dots
    {
        name: "glowing-dots",
        description: "Glowing Dots",
        projectIndex: 34,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "scale",
                type: "float",
            },
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.5, 1.0],
                valueRange: [ 0.95, 1.0 ]
            },
        ]
    },
    // Moving Grid
    {
        name: "moving-grid",
        description: "Moving Grid",
        projectIndex: 35,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "scale",
                type: "float",
            },
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.5, 1.0],
                valueRange: [ 0.95, 1.0 ]
            },
        ]
    },
    // Dots Flow
    {
        name: "dots-flow",
        description: "Dots Flow",
        projectIndex: 36,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "color",
                type: "color",
                saturationRange: [ 0.5, 1.0],
                valueRange: [ 0.95, 1.0 ]
            },
        ]
    },
    // Led Wall
    {
        name: "led-wall",
        description: "Led Wall",
        projectIndex: 37,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            },
        ],
        params: [
            {
                name: "speed",
                type: "float",
            },
            {
                name: "scale",
                type: "float",
            },
            {
                name: "reverse",
                type: "bool",
            },
        ]
    },
    // Monologue
    {
        name: "monologue",
        projectIndex: 20,
        tags: [
            "monologue",
        ],
        description: "Monologue",
        fades: [
            {
                elements: [
                    "contres",
                    "diags",
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Faces" ],
                relativeOffset: 0.25,
            }
        ],
        steps: [
            {
                name: "projection",
                elements: [
                    "Projection",
                    "Shutter"
                ]
            },
            {
                name: "pf chaud",
                elements: [
                    "Faces",
                    "Lats",
                    "Contres"
                ]
            }
        ],
        values: [
            {
                name: "text",
                type: "string",
            }
        ]
    },
]