import { DurationProviderCollectionProps } from "@/lib/aleas/providers/duration";
import { StageLightingPlan } from "../dmx/dmx512";
import { setDocument } from "../firebase";


export default async function seedLightingPlans() {

    const name = "default"

    const coll: StageLightingPlan[] = [
        {
            name: "Pierre - Light",
            fixtureCollection: "default",
            fixtures: [
                {
                    name: "Par LED RGB Jar",
                    model: "Par LED RGBUv",
                    address: 1,
                    mode: 6
                },
                {
                    name: 'Flat Par LED CW WW',
                    model: "Par LED CW/WW",
                    address: 7,
                    mode: 6
                },
                {
                    name: 'Flat Par LED CW WW',
                    model: "Par LED CW/WW",
                    address: 13,
                    mode: 6
                },
                {
                    name: "Par LED RGB Cour",
                    model: "Par LED RGBUv",
                    address: 1,
                    mode: 19
                }
            ]
        },
        {
            name: 'Improvibar',
            fixtureCollection: 'default',
            fixtures: [
                // Pars Jardin / Cour
                {
                    name: "PAR Led Rgb - Jar",
                    model: 'Par LED RGBW',
                    mode: 6,
                    address: 11
                },
                {
                    name: "PAR Led Rgb - Cour",
                    model: 'Par LED RGBW',
                    mode: 6,
                    address: 17
                },

                // Contres
                {
                    name: "PAR Led Rgb - Contre 1",
                    model: 'Par LED RGBW',
                    mode: 6,
                    address: 41
                },
                {
                    name: "PAR Led Rgb - Contre 2",
                    model: 'Par LED RGBW',
                    mode: 6,
                    address: 35
                },
                {
                    name: "PAR Led Rgb - Contre 3",
                    model: 'Par LED RGBW',
                    mode: 6,
                    address: 29
                },
                {
                    name: "PAR Led Rgb - Contre 4",
                    model: 'Par LED RGBW',
                    mode: 6,
                    address: 23
                },
            ]
        }
    ]

    coll.forEach(async plan => {
        await setDocument<StageLightingPlan>(`dmx/lightingPlans/public/${name}`, plan);
    })
}