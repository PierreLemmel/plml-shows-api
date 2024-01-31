import { AleasMainLayout } from "@/components/aleas-components/aleas-layout";
import AleasSkeletonLoader from "@/components/aleas-components/aleas-skeleton-loader";
import { aleasToast } from "@/components/aleas-components/aleas-toast-container";
import ShowEditor from "@/components/dmx/show/show-editor";
import { useRouterQuery } from "@/lib/services/api/routing";
import { createShow, renameShowIfNeeded, showExists, updateShow } from "@/lib/services/api/show-control-api";
import { pathCombine } from "@/lib/services/core/files";
import { AsyncDispatch } from "@/lib/services/core/types/utils";
import { createNewShow, Show, useShowContext } from "@/lib/services/dmx/showControl";
import { useCallback, useEffect, useState } from "react";

const NewShowPage = () => {

    const {
        setShow: setShowInContext
    } = useShowContext()

    const [show, setShow] = useState<Show>()

    const {
        ["lp"]: lpName
    } = useRouterQuery("lp");

    useEffect(() => {
        const newShow = createNewShow(lpName);
        setShow(newShow);
        setShowInContext(newShow);
    }, [lpName])

    const [firstSaved, setFirstSaved] = useState(false);
    const saveShow = useCallback<AsyncDispatch<Show>>(firstSaved ? 
        async (newShow: Show) => {

            await renameShowIfNeeded(lpName, show!.name, newShow.name);
            await updateShow(newShow);

            setShow(newShow);
        }:
        async (newShow: Show) => {

            await createShow(newShow);

            setFirstSaved(true);
            setShow(newShow);
        },
    [firstSaved, lpName])
    
    const renameValidation = useCallback(async (newName: string) => {
        const alreadyExists = await showExists(lpName, newName)
        return !alreadyExists;
    }, [lpName])

    const onRenameFail = useCallback((badName: string) =>{
        aleasToast.error(`Le spectacle '${badName}' existe déjà.`)
    }, [])

    return <AleasMainLayout
        title="Nouveau spectacle"
        titleDisplay={false}
        requireAuth
    >
        {show ?
            <ShowEditor
                show={show}
                saveShow={saveShow}
                onMessage={aleasToast.info}
                canRename={true}
                onRenameFail={onRenameFail}
                renameValidation={renameValidation}
                sceneEditPath={scene => pathCombine(
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

export default NewShowPage;