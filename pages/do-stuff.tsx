import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout"
import { isDev } from "@/lib/services/api/api";
import { getAudioClipCollection } from "@/lib/services/api/audio";
import { listFiles, updateDocument } from "@/lib/services/api/firebase";
import { AudioClipData } from "@/lib/services/audio/audioControl";
import { pathCombine } from "@/lib/services/core/files";
import { stringToKey } from "@/lib/services/core/utils";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";

interface DoStuffProps {
    isDev: boolean;
}

export const getStaticProps: GetStaticProps<DoStuffProps> = async () => {

    return {
        props: {
            isDev: isDev()
        }
    }
}

const DoStuff = (props: DoStuffProps) => {

    const { isDev } = props;

    useEffect(() => {
        if (!isDev) {
            throw new Error("This page is only available in dev mode");
        }
    }, [isDev]);

    const doStuff = async () => {

        const collectionName = "Aiva";

        const collection = await getAudioClipCollection(collectionName);
        const newClips: { [key: string]: AudioClipData } = {};
        for(const clipName in collection.clips) {
            
            const oldClip = collection.clips[clipName];
            const key = stringToKey(clipName);
            newClips[key] = {
                ...oldClip,
                key
            }
        }

        console.log(newClips);

        const newCollection = {
            ...collection,
            clips: newClips
        }

        console.log(newCollection)
        const pathToCollection = pathCombine("audio", collectionName).toLowerCase();
        updateDocument(pathToCollection, newCollection);
    };

    const [working, setWorking] = useState<boolean>(false);

    const onClick = async () => {
        setWorking(true);
        console.log("Doing stuff")
        await doStuff();
        console.log("Done doing stuff")
        setWorking(false);
    }

    return <AleasMainLayout
        navbar requireAuth
    >
        {isDev && <AleasButton spinning={working} onClick={onClick}>Do Stuff</AleasButton>}
    </AleasMainLayout>
}

export default DoStuff;