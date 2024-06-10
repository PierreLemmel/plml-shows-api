import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout"
import { isDev } from "@/lib/services/api/api";
import { getAudioClipCollection } from "@/lib/services/api/audio";
import { listFiles, updateDocument } from "@/lib/services/api/firebase";
import { getFixtureCollection, updateFixtureCollection } from "@/lib/services/api/show-control-api";
import { AudioClipData } from "@/lib/services/audio/audioControl";
import { pathCombine } from "@/lib/services/core/files";
import { stringToKey } from "@/lib/services/core/utils";
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
        const coll = await getFixtureCollection("default");

        const fixturesToAdd: Fixtures.FixtureModelDefinition[] = [

        ]
        const updatedFixtures: { [shortName: string]: Fixtures.FixtureModelDefinition } = {
            ...coll.fixtureModels
        }

        fixturesToAdd.forEach(f => {
            updatedFixtures[f.shortName] = f;
        });

        await updateFixtureCollection({
            name: "default",
            fixtureModels: updatedFixtures
        });
        console.log(coll);
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