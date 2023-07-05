import { generateId } from "../../core/utils";
import { Show } from "../../dmx/showControl";
import { createShow } from "../show-control-api";


export default async function seedShows() {

    const shows: Show[] = [
        {
            name: "Test - Pierre",
            id: generateId(),
            lightingPlan: "Pierre - Light",
            scenes: [
                {
                    name: "Jar Chaud",
                    id: generateId(),
                    elements: [
                        {
                            fixture: "flatParJar",
                            values: {
                                "Dimmer": 255,
                                "Warm": 255
                            }
                        }
                    ]
                },
                {
                    name: "Jar Froid",
                    id: generateId(),
                    elements: [
                        {
                            fixture: "flatParJar",
                            values: {
                                "Dimmer": 255,
                                "Cold": 255
                            }
                        }
                    ]
                },
                {
                    name: "Full froid",
                    id: generateId(),
                    elements: [
                        {
                            fixture: "flatParJar",
                            values: {
                                "Dimmer": 255,
                                "Warm": 255
                            }
                        },
                        {
                            fixture: "flatParCour",
                            values: {
                                "Dimmer": 255,
                                "Warm": 255
                            }
                        },
                        {
                            fixture: "parLedRgbJar",
                            values: {
                                "Dimmer": 255,
                                "Color": "white"
                            }
                        },
                        {
                            fixture: "parLedRgbCour",
                            values: {
                                "Dimmer": 255,
                                "Color": "white"
                            }
                        },
                    ]
                },
            ]
        },
        {
            name: 'Aléas - Improvibar',
            id: generateId(),
            lightingPlan: 'Improvibar',
            scenes: []
        },
    ]

    shows.forEach(createShow)
}