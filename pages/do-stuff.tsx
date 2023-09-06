import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout"
import { isDev } from "@/lib/services/api/api";
import { setDocument } from "@/lib/services/api/firebase";
import { pathCombine } from "@/lib/services/core/files";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { CompletionsData } from "@/lib/services/generation/text-gen";
import { GetStaticProps } from "next";

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

    const doStuff = async () => {
        if (!isDev) {
            throw new Error("This page is only available in dev mode");
        }

        console.log("Just doing stuff");
    };


    return <AleasMainLayout
        navbar requireAuth
    >
        
        <AleasButton onClick={async () => await doStuff()}>Do Stuff</AleasButton>
    </AleasMainLayout>
}

export default DoStuff;