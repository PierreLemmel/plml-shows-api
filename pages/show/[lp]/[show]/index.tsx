import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import { aleasToast } from "@/components/aleas-components/aleas-toast-container";
import ShowEditor from "@/components/dmx/show/show-editor";
import { useRouterQuery } from "@/lib/services/api/routing";
import { renameShowIfNeeded, updateShow } from "@/lib/services/api/show-control-api";
import { pathCombine } from "@/lib/services/core/files";
import { useShowContext, useLoadShowInContextIfNeeded, Show } from "@/lib/services/dmx/showControl";
import { useCallback } from "react";


const ShowPage = () => {
   
    const showContext = useShowContext();
    const {
        show,
        setShow
    } = showContext;

    const {
        "lp": lpName,
        "show": showName
    } = useRouterQuery("lp", "show");

    useLoadShowInContextIfNeeded(lpName, showName);

    const saveShow = useCallback(async (updatedShow: Show) => {

        await renameShowIfNeeded(lpName, show!.name, updatedShow.name);
        await updateShow(updatedShow);

        setShow(updatedShow);
    }, [lpName, show])

    return <AleasMainLayout
        title={showName}
        titleDisplay={false}
        requireAuth
    >
        {show ?
            <ShowEditor
                show={show}
                saveShow={saveShow}
                onMessage={aleasToast.info}
                sceneEditPath={scene => "/" + pathCombine(
                    "show",
                    lpName,
                    show.name,
                    "scenes/edit",
                    scene
                )}
            /> :
            <AleasSkeletonLoader />
        }
    </AleasMainLayout>
}


export default ShowPage
