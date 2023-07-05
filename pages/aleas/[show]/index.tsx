import { AleasMainLayout } from "@/components/aleas/aleas-layout"
import AleasSkeletonLoader from "@/components/aleas/aleas-skeleton-loader";
import { getAleasShow } from "@/lib/services/aleas/aleas-api";
import { useAleasRuntime } from "@/lib/services/aleas/aleas-runtime";
import { AleasShow, AleasShowInfo, useAleasShowInfo } from "@/lib/services/aleas/aleas-setup";
import { getShow } from "@/lib/services/api/show-control-api";
import { pathCombine } from "@/lib/services/core/files";

import { useEffectAsync } from "@/lib/services/core/hooks";
import { mergeClasses } from "@/lib/services/core/utils";
import { useShowControl, useShowInfo } from "@/lib/services/dmx/showControl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AleasShowDisplay = () => {

    //const { state } = useAleasRuntime()

    const showControl = useShowControl();
    
    const router = useRouter();
    const showName = router.query["show"] as string|undefined;

    const foo = useShowInfo();

    const [aleasShow, setAleasShow] = useState<AleasShow|null>(null);
    const aleasShowInfo = useAleasShowInfo(aleasShow, foo);

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

    return <AleasMainLayout title="Aléas" navbar={true} requireAuth titleDisplay={false}>
        <div className={mergeClasses(
            "full overflow-auto max-h-[70vh]"
        )}>
            {aleasShowInfo ?
                <AleasShowInfoDisplay showInfo={aleasShowInfo} /> :
                <div className="full center-child p-12">
                    <AleasSkeletonLoader lines={8} className="gap-4" />
                </div>
            }
        </div>
    </AleasMainLayout>
}

interface ShowDisplayProps {
    showInfo: AleasShowInfo;
}

const AleasShowInfoDisplay = (props: ShowDisplayProps) => {
    const { showInfo } = props;

    const {
        name,
        show
    } = showInfo;
    
    return <div className={mergeClasses(
        "flex flex-col items-center justify-center gap-4"
    )}>
        <div className="text-xl">{name}</div>

        {/* Show */}
        <Block title={"Spectacle associé"}>
            
            <Link href={pathCombine('./shows/', show.name)}>{show.name}</Link>
            
        </Block>
        <div>{JSON.stringify(showInfo)}</div>
    </div>
}

interface BlockProps {
    children: React.ReactNode[]|React.ReactNode,
    title: string
}

const Block = ({ children, title }: BlockProps) => <div>
    <div className="text-lg mb-2">{title}</div>
    <div>
        {children}
    </div>
</div>


export default AleasShowDisplay;