import { setDocument } from "../firebase";

export default async function seedRandomTimerDurations() {

    // const coll: DurationProviderCollectionProps = {
    //     name: "Timer default",
    //     providers: [
    //         {
    //             name: "Short",
    //             canChain: false,
    //             active: true,
    //             weight: 6.5,
    //             minDuration: 5,
    //             maxDuration: 20,
    //         },
    //         {
    //             name: "Medium",
    //             canChain: true,
    //             active: true,
    //             weight: 25,
    //             minDuration: 40,
    //             maxDuration: 200,
    //         },
    //         {
    //             name: "Long",
    //             canChain: true,
    //             active: true,
    //             weight: 12,
    //             minDuration: 220,
    //             maxDuration: 360,
    //         },
    //         {
    //             name: "Super long",
    //             canChain: false,
    //             active: true,
    //             weight: 5,
    //             minDuration: 800,
    //             maxDuration: 1200,
    //         }
    //     ]
    // }

    // await setDocument<DurationProviderCollectionProps>("aleas/providers/duration/timer-default", coll);
}