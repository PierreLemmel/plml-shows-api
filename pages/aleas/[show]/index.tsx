import { AleasMainLayout } from "@/components/aleas/aleas-layout"
import { useAleasRuntime } from "@/lib/services/aleas/aleas-runtime";
import { getShow } from "@/lib/services/aleas/aleas-api";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { useRouter } from "next/router";
import { useEffect } from "react";

const AleasShow = () => {

    //const { state } = useAleasRuntime()

    const router = useRouter();
    const showName = router.query["show"] as string;

    useEffectAsync(async () => {
        await getShow(showName)
    }, [showName])

    return <AleasMainLayout title="Aléas">

    </AleasMainLayout>
}

export default AleasShow;