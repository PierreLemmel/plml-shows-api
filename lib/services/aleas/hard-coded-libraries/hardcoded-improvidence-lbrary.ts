import { AleasContentScene } from "../aleas-generation";

export const hardCodedImprovidenceLibrary: AleasContentScene[] = [
    // Intro
    {
        name: "intro",
        projectIndex: 4,
        description: "Intro",
        tags: [ "intro" ],
        steps: [
            {
                name: "intro-01",
                elements: [ "Poursuite" ]
            },
            {
                name: "Intro-02",
                elements: [ "Lat Jar" ]
            },
            {
                name: "Intro-03",
                elements: [ "Douche centrale" ]
            },
            {
                name: "Intro-04",
                elements: [ "Lat Cour" ]
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
        projectIndex: 5,
        description: "Outro",
        tags: [ "outro" ],
        steps: [
            {
                name: "intro-01",
                elements: [ "Poursuite" ]
            },
            {
                name: "Intro-02",
                elements: [ "Lat Jar" ]
            },
            {
                name: "Intro-03",
                elements: [ "Douche centrale" ]
            },
            {
                name: "Intro-04",
                elements: [ "Lat Cour" ]
            }
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
        projectIndex: 6,
        description: "Confessionnal",
        tags: [ "confessionnal"],
        fades: [
            {
                elements: [
                    "Timer projection",
                    "Shutter"
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
        projectIndex: 7,
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
                elements: [ "diags" ],
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
        projectIndex: 8,
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
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
            }
        ]
    },
    // Bicolor
    {
        name: "bicolor",
        projectIndex: 9,
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
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
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
        projectIndex: 10,
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
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
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
    // Douche
    {
        name: "douche",
        projectIndex: 11,
        description: "Douche",
        tags: [
            "douche",
            "isolation"
        ],
        fades: [
            {
                elements: [ "Douche" ],
                relativeOffset: 0.,
            }
        ]
    },
    // White rotation
    {
        name: "white-rotation",
        projectIndex: 12,
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
    // PF Chaud - Bascule Couleur
    {
        name: "pf-ch-basc-col",
        projectIndex: 13,
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
    // Color swap x2
    {
        name: "col-swap-2",
        projectIndex: 14,
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
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
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
        projectIndex: 15,
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
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
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
    // Color Bascule Douche
    {
        name: "col-basc-douche",
        projectIndex: 16,
        description: "Color Bascule Douche",
        tags: [
            "color",
            "bascule",
            "bascule-col"
        ],
        fades: [
            {
                elements: [
                    "Colors",
                    "Douche"
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
                saturationRange: [ 0.3, 1.0 ],
                valueRange: [ 0.65, 1.0 ]
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
        projectIndex: 17,
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
        projectIndex: 18,
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
        projectIndex: 19,
        tags: [
            "projection",
        ],
        description: "Projection - Input",
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
        params: [
            {
                name: "input",
                type: "string",
            },
        ],
        steps: [
            {
                name: "proj-input",
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
    // Line Swipe
    {
        name: "line-swipe",
        projectIndex: 21,
        description: "Line Swipe",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [
                    "Background",
                    "Shutter"
                ],
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
        projectIndex: 22,
        description: "Face Line",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [
                    "Line",
                    "Shutter"
                ],
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
        projectIndex: 23,
        description: "Double Face Line",
        tags: [
            "mapping",
            "mapping-geometric"
        ],
        fades: [
            {
                elements: [
                    "Lines",
                    "Shutter"
                ],
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
    // Clouds
    {
        name: "clouds",
        description: "Clouds",
        projectIndex: 24,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Foreground",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.45,
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
            {
                name: "fg-color",
                type: "color",
                link: {
                    to: "color",
                    hueRotation: [1/3, 1/2, 2/3, 0],
                    valueOffset: [-0.25, -0.1]
                }
            }
        ]
    },
    // Glowing Dots
    {
        name: "glowing-dots",
        description: "Glowing Dots",
        projectIndex: 25,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Foreground",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.45,
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
            {
                name: "fg-color",
                type: "color",
                link: {
                    to: "color",
                    hueRotation: [1/3, 1/2, 2/3, 0],
                    valueOffset: [-0.25, -0.1]
                }
            }
        ]
    },
    // Moving Grid
    {
        name: "moving-grid",
        description: "Moving Grid",
        projectIndex: 26,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Master",
                    "Shutter"
                ],
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
        projectIndex: 27,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Foreground",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.45,
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
            {
                name: "fg-color",
                type: "color",
                link: {
                    to: "color",
                    hueRotation: 0,
                    valueOffset: [-0.25, -0.1]
                }
            }
        ]
    },
    // Led Wall
    {
        name: "led-wall",
        description: "Led Wall",
        projectIndex: 28,
        tags: [
            "mapping",
            "mapping-wallpaper"
        ],
        fades: [
            {
                elements: [
                    "Foreground",
                    "Shutter"
                ],
                relativeOffset: 0.,
            },
            {
                elements: [ "Background" ],
                relativeOffset: 0.45,
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
    // Lats - Alternate
    {
        name: "lats-alternate",
        projectIndex: 29,
        description: "Lats - Alternate",
        tags: [
            "standard",
            "lats"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ],
        steps: [
            {
                name: "Jardin",
                elements: [ "lat-jar" ]
            },
            {
                name: "Cour",
                elements: [ "lat-cour" ]
            }
        ]
    },
    // Diags - Alternate
    {
        name: "diags-alternate",
        projectIndex: 30,
        description: "Diags - Alternate",
        tags: [
            "standard",
            "diags"
        ],
        fades: [
            {
                elements: [ "Master" ],
                relativeOffset: 0.,
            }
        ],
        steps: [
            {
                name: "Jardin",
                elements: [ "diag-jar" ]
            },
            {
                name: "Cour",
                elements: [ "diag-cour" ]
            }
        ]
    },
    // Autos Tracking
    {
        name: "autos-tracking",
        projectIndex: 31,
        tags: [
            "autos"
        ],
        description: "Autos Tracking",
        fades: [
            {
                relativeOffset: 0.,
                elements: [ "colors" ]
            },
            {
                relativeOffset: 0.25,
                elements: [ "faces" ]
            }
        ],
        params: [
            {
                name: "color",
                type: "color",
                valueRange: [ 0.7, 1.0 ],
                saturationRange: [ 1.0, 1.0 ]
            },
        ],
        values: [
            "jar1Pan",
            "jar1Tilt",
            "jar2Pan",
            "jar2Tilt",
            "cour1Pan",
            "cour1Tilt",
            "cour2Pan",
            "cour2Tilt",
        ].map(name => ({
            name,
            type: "float",
            mapAsGlobal: true
        }))
    },
    // Lat Jar
    {
        name: "lat-jar",
        projectIndex: 32,
        tags: [
            "Isolation"
        ],
        description: "Lat Jar",
        fades: [
            {
                relativeOffset: 0.,
                elements: [ "master" ]
            }
        ],
    },
    // Diag Cour
    {
        name: "diag-cour",
        projectIndex: 33,
        tags: [
            "Isolation"
        ],
        description: "Diag Cour",
        fades: [
            {
                relativeOffset: 0.,
                elements: [ "master" ]
            }
        ],
    },
    
]