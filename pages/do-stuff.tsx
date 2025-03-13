import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout"
import { isDev } from "@/lib/services/api/api";
import { deleteDocument, getDocument, renameDocument, setDocument } from "@/lib/services/api/firebase";
import { sequence } from "@/lib/services/core/utils";
import { CompletionsData } from "@/lib/services/generation/text/text-gen";
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

        //...
        
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