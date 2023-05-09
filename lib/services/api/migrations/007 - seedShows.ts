import { Show } from "../../dmx/showControl";
import { setDocument } from "../firebase";
import { saveShow } from "../showControlApi";


export default async function seedShows() {

    const shows: Show[] = [
        {
            name: "Test - Pierre",
            lightingPlan: "Pierre - Light",
            scenes: [
                {
                    name: "Jar Chaud",
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
            lightingPlan: 'Improvibar',
            scenes: []
        },
    ]

    shows.forEach(saveShow)
}