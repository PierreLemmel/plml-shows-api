import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout"
import { isDev } from "@/lib/services/api/api";
import { setDocument } from "@/lib/services/api/firebase";
import { pathCombine } from "@/lib/services/core/files";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { CompletionsData } from "@/lib/services/generation/text-gen";
import { GetStaticProps } from "next";
import { useEffect } from "react";

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
        if (!isDev) {
            throw new Error("This page is only available in dev mode");
        }

        console.log("Just doing stuff");
    };


    return <AleasMainLayout
        navbar requireAuth
    >
        {isDev && <AleasButton onClick={async () => await doStuff()}>Do Stuff</AleasButton>}
    </AleasMainLayout>
}

export default DoStuff;