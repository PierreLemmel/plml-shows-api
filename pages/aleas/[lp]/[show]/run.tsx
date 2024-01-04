import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import { aleasToast } from "@/components/aleas-components/aleas-toast-container";
import { createAleasRun, getAleasShow } from "@/lib/services/aleas/aleas-api";
import { AleasRuntime, AleasShowRun, generateAleasShowRun, useAleasRuntime } from "@/lib/services/aleas/aleas-runtime";
import { AleasShow, useAleasShowInfo } from "@/lib/services/aleas/aleas-setup";
import { useAuth } from "@/lib/services/api/firebase";
import { useRouterQuery } from "@/lib/services/api/routing";
import { useEffectAsync } from "@/lib/services/core/hooks";
import { match } from "@/lib/services/core/utils";
import { useShowContext, useShowInfo } from "@/lib/services/dmx/showControl";
import { useCallback, useEffect, useState } from "react";

const AleasShowRun = () => {

    const showControl = useShowContext();
    const auth = useAuth();

    const {
        "lp": lpName,
        "show": showName
    } = useRouterQuery("lp", "show");

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

    const canGenerate = showInfo && auth.user;
    const regenerateRun = useCallback(async () => {

        if (!aleasShowInfo || !auth.user) {
            return;
        }

        const newRun = await generateAleasShowRun(aleasShowInfo, auth.user.uid)
        setRun(newRun);

        await createAleasRun(newRun);

        aleasToast.success("Run généré !")
    }, [showInfo, auth.user])

    const runtime = useAleasRuntime(run);

    return <AleasMainLayout
        requireAuth
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
        currentScene,
        sceneMaster,

        currentAudio,
        audioVolume,

        state,

        play,
        startShow,
        stopShow,
        stop,
    } = runtime;


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
            "Show": <div className="flex flex-col gap-1 items-center">
                <div className="text-4xl">Aléas</div>
                <div>Spectacle en cours</div>

                <div className="mt-3">Temps : {currentTime.toFixed(2)}s</div>
                <div>Restant : {(duration - currentTime).toFixed(2)}s</div>
                
                <div className="mt-3">Scène actuelle : {currentScene?.scene.name ?? "Blackout"}</div>
                {currentScene && <div>Master : {(sceneMaster * 100).toFixed(1)}%</div>}
                
                <div className="mt-3">Musique actuelle : {currentAudio?.name ?? "-"}</div>
                {currentAudio && <div>Volume : {(audioVolume * 100).toFixed(1)}%</div>}
                
                <div className="flex flex-rox gap-4 mt-6">
                    <AleasButton onClick={startShow}>Go !</AleasButton>
                    <AleasButton onClick={stop}>Stop</AleasButton>
                </div>
            </div>,
        })}
    </div>
}

export default AleasShowRun;