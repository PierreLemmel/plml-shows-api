import { AleasButton } from "@/components/aleas/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas/aleas-layout";
import { toast } from "@/components/aleas/aleas-toast-container";
import { createAleasRun, getAleasShow } from "@/lib/services/aleas/aleas-api";
import { AleasRuntime, AleasShowRun, generateAleasShowRun, useAleasRuntime } from "@/lib/services/aleas/aleas-runtime";
import { AleasShow, useAleasShowInfo } from "@/lib/services/aleas/aleas-setup";
import { useAuth } from "@/lib/services/api/firebase";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { match } from "@/lib/services/core/utils";
import { Scene, toScene, useRealtimeScene, useShowControl, useShowInfo } from "@/lib/services/dmx/showControl";
import { create } from "domain";
import { useRouter } from "next/router";
import { use, useCallback, useEffect, useMemo, useState } from "react";

const AleasShowRun = () => {

    const showControl = useShowControl();
    const auth = useAuth();

    const router = useRouter();
    const showName = router.query["show"] as string|undefined;

    const showInfo = useShowInfo();

    const [aleasShow, setAleasShow] = useState<AleasShow|null>(null);
    const aleasShowInfo = useAleasShowInfo(aleasShow, showInfo);

    const [run, setRun] = useState<AleasShowRun|null>(null);

    useEffectAsync(async () => {

        if (showName) {
            const show = await getAleasShow(showName)
            setAleasShow(show);
        }
        
    }, [showName])

    useEffect(() => {

        if (aleasShow) {
            showControl.loadShow(aleasShow.showName)
        }
    }, [aleasShow?.showName])

    const canGenerate = showInfo && auth.user;
    const regenerateRun = useCallback(async () => {

        if (!aleasShowInfo || !auth.user) {
            return;
        }

        const newRun = await generateAleasShowRun(aleasShowInfo, auth.user.uid)
        setRun(newRun);

        await createAleasRun(newRun);

        toast.success("Run généré !")
    }, [showInfo, auth.user])

    const runtime = useAleasRuntime(run);

    return <AleasMainLayout
        toasts requireAuth
        navbar={!runtime || runtime.state === "Stopped"}
        titleDisplay={false}
        title={aleasShow?.showName ?? "Aléas"}
    >
        {runtime && run ?
            <RuntimeDisplay runtime={runtime} /> :
            <div className="flex flex-col items-center justify-center gap-6">
                <AleasButton onClick={() => regenerateRun()} disabled={!canGenerate}>
                    Générer spectacle
                </AleasButton>
            </div>
        }

    </AleasMainLayout>
}

interface RuntimeDisplayProps {
    runtime: AleasRuntime;
}

const RuntimeDisplay = (props: RuntimeDisplayProps) => {

    const { runtime } = props;
    const {
        run: {
            duration
        },

        currentTime,
        state,

        play,
        startShow,
        stopShow,
        stop,
    } = runtime;

    const realTimeScene = useMemo<Scene|undefined>(() => runtime.currentScene ? toScene(runtime.currentScene.scene) : undefined, [runtime.currentScene])
    useRealtimeScene(realTimeScene);

    return <div className="full flex flex-col items-center justify-center">
        {match(state, {
            "Stopped": <div className="flex flex-col gap-4 items-center">
                <div className="text-4xl">Aléas</div>
                <div>Arrêté</div>
                <AleasButton onClick={play}>Jouer</AleasButton>
            </div>,
            "BeforeShow": <div className="flex flex-col gap-4 items-center">
                <div className="text-4xl">Aléas</div>
                <div>Pré-spectacle</div>
                <div className="flex flex-rox gap-4">
                    <AleasButton onClick={startShow}>Go !</AleasButton>
                    <AleasButton onClick={stop}>Stop</AleasButton>
                </div>
            </div>,
            "AfterShow": <div className="flex flex-col gap-4 items-center">
                <div className="text-4xl">Aléas</div>
                <div>Post-spectacle</div>
                <div className="flex flex-rox gap-4">
                    <AleasButton onClick={stop}>Stop</AleasButton>
                </div>
            </div>,
            "Show": <div className="flex flex-col gap-4 items-center">
                <div className="text-4xl">Aléas</div>
                <div>Spectacle en cours</div>
                <div>Temps : {currentTime.toFixed(2)}</div>
                <div>Restant : {(duration - currentTime).toFixed(2)}</div>
                <div>Scène actuelle : {runtime.currentScene?.scene.name}</div>
                <div className="flex flex-rox gap-4">
                    <AleasButton onClick={startShow}>Go !</AleasButton>
                    <AleasButton onClick={stop}>Stop</AleasButton>
                </div>
            </div>,
        })}
    </div>
}

export default AleasShowRun;