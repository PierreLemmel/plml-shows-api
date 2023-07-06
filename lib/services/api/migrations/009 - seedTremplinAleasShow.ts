import { createAleasShow } from "../../aleas/aleas-api";
import { AleasShow } from "../../aleas/aleas-setup";
import { generateId } from "../../core/utils";

export default async function seedTremplinAleasShow() {

    // const tremplinAleasShow: AleasShow = {
    //     showName: "Tremplin - Baladins",
    //     generation: {
    //         showDuration: 3600,
    //         blackoutDuration: 5
    //     },
    //     providers: {
    //         audio: [
    //             {
    //                 type: "FromCollection",
    //                 collectionName: "aiva",
    //                 id: generateId(),
    //                 name: "AIVA",
    //                 canChain: true,
    //                 active: true,
    //                 weight: 4,
    //                 volume: {
    //                     min: 0.65,
    //                     max: 1.0
    //                 }
    //             },
    //             {
    //                 type: "NoAudio",
    //                 name: "No Audio",
    //                 id: generateId(),
    //                 canChain: true,
    //                 active: true,
    //                 weight: 10,
    //             }
    //         ],
    //         durations: [
    //             {
    //                 active: true,
    //                 canChain: false,
    //                 id: generateId(),
    //                 name: "Short",
    //                 weight: 6.5,
    //                 duration: {
    //                     min: 5,
    //                     max: 15
    //                 },
    //                 fade: {
    //                     min: 0,
    //                     max: 1.2
    //                 }
    //             },
    //             {
    //                 active: true,
    //                 canChain: true,
    //                 id: generateId(),
    //                 name: "Medium",
    //                 weight: 25,
    //                 duration: {
    //                     min: 40,
    //                     max: 200
    //                 },
    //                 fade: {
    //                     min: 0.7,
    //                     max: 3.5
    //                 }
    //             },
    //             {
    //                 active: true,
    //                 canChain: true,
    //                 id: generateId(),
    //                 name: "Long",
    //                 weight: 12,
    //                 duration: {
    //                     min: 220,
    //                     max: 360
    //                 },
    //                 fade: {
    //                     min: 0.8,
    //                     max: 8
    //                 }
    //             },
    //             {
    //                 active: true,
    //                 canChain: false,
    //                 id: generateId(),
    //                 name: "Super long",
    //                 weight: 3.8,
    //                 duration: {
    //                     min: 5,
    //                     max: 15
    //                 },
    //                 fade: {
    //                     min: 0,
    //                     max: 1.2
    //                 }
    //             },
    //         ],
    //         scenes: [],
    //     },
    //     name: "Tremplin - Baladins",
    //     id: generateId(),
    // }

    // await createAleasShow(tremplinAleasShow);
}