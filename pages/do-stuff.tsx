import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout"
import { isDev } from "@/lib/services/api/api";
import generateLoudlySongs from "@/lib/services/generation/audio/loudly-api";
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

        console.log("Just doing stuff");
    };

    const [working, setWorking] = useState<boolean>(false);

    const onClick = async () => {
        setWorking(true);
        await doStuff();
        setWorking(false);
    }

    return <AleasMainLayout
        navbar requireAuth
    >
        {isDev && <AleasButton spinning={working} onClick={onClick}>Do Stuff</AleasButton>}
    </AleasMainLayout>
}

export default DoStuff;