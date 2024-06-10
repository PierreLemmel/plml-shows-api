import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout"
import { AleasAudioLibrary } from "@/lib/services/aleas/aleas-generation";
import { isDev } from "@/lib/services/api/api";
import { setDocument } from "@/lib/services/api/firebase";
import { getFixtureCollection, updateFixtureCollection } from "@/lib/services/api/show-control-api";
import { pathCombine } from "@/lib/services/core/files";
import { generateId } from "@/lib/services/core/utils";
import { Fixtures } from "@/lib/services/dmx/dmx512";
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

        const libraries: AleasAudioLibrary[] = [
            {
                name: "Aléas - Général",
                key: "aleas-general",
                count: 68
            },
            {
                name: "Aléas - Ambient",
                key: "aleas-ambient",
                count: 16
            },
            {
                name: "Aléas - Loud",
                key: "aleas-loud",
                count: 22
            },
            {
                name: "Aléas - Standalone",
                key: "aleas-standalone",
                count: 12
            },
            {
                name: "Aléas - Text",
                key: "aleas-text",
                count: 7
            },
            {
                name: "Aléas - WTF",
                key: "aleas-wtf",
                count: 3
            },
            {
                name: "Aléas - Billetreduc",
                key: "aleas-billetreduc",
                count: 17
            }
        ]

        await setDocument(
            pathCombine("aleas", "library", "audio", "aleas-2024"),
            {
                libraries,
                id: generateId(),
                name: "Aléas 2024",
                shortName: "aleas-2024",
            }
        );
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