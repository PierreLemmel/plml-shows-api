import { AleasMainLayout } from "@/components/aleas/aleas-layout"
import { getAleasShow } from "@/lib/services/aleas/aleas-api";
import { useAleasRuntime } from "@/lib/services/aleas/aleas-runtime";
import { AleasShow, useAleasShowInfo } from "@/lib/services/aleas/aleas-setup";
import { getShow } from "@/lib/services/api/show-control-api";

import { useEffectAsync } from "@/lib/services/core/hooks";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AleasShowDisplay = () => {

    //const { state } = useAleasRuntime()
    
    const router = useRouter();
    const showName = router.query["show"] as string|undefined;
    const [aleasShow, setAleasShow] = useState<AleasShow|null>(null);
    const showInfo = useAleasShowInfo(aleasShow);

    useEffectAsync(async () => {

        if (showName) {
            const show = await getAleasShow(showName)
            setAleasShow(show);
        }
        
    }, [showName])

    return <AleasMainLayout title="Aléas">
        {JSON.stringify(showInfo)}
    </AleasMainLayout>
}

export default AleasShowDisplay;