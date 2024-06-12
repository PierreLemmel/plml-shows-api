import { AleasButton } from "@/components/aleas-components/aleas-buttons";
import { AleasMainLayout } from "@/components/aleas-components/aleas-layout"
import { AleasAudioLibrary } from "@/lib/services/aleas/aleas-generation";
import { isDev } from "@/lib/services/api/api";
import { setDocument } from "@/lib/services/api/firebase";
import { getShow, updateShow } from "@/lib/services/api/show-control-api";
import { pathCombine } from "@/lib/services/core/files";
import { Color } from "@/lib/services/core/types/rgbColor";
import { generateId, sequence } from "@/lib/services/core/utils";
import { Scene } from "@/lib/services/dmx/showControl";
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

        const lp = "impro-en-seine";
        const showName = "aléas2024";
        const show = await getShow(lp, showName);

        const scenes = show.scenes;
        const template = scenes[scenes.length - 1];

        const colorCount = 12;
        const saturation = 0.7;
        const value = 1;        
        const scenesToAdd: Scene[] = sequence(colorCount).map(i => {

            const hue1 = i * 360 / colorCount;
            const hue2 = (hue1 + 180) % 360;

            const hsv1 = Color.hsv(hue1, saturation, value);
            const hsv2 = Color.hsv(hue2, saturation, value);
            const rgb1 = Color.hsvToRgb(hsv1);
            const rgb2 = Color.hsvToRgb(hsv2);
            const { elements } = template;

            const newElements = structuredClone(elements);
            
            newElements.forEach(element => {
                const { fixture, values } = element;

                if(!values["Color"]) {
                    return;
                }
                
                if (fixture.startsWith("parLed")) {
                    element.values["Color"] = rgb1;
                }
                else if (fixture.startsWith("rampeLed")) {
                    element.values["Color"] = rgb2;
                }
            })
            return {
                id: generateId(),
                name: `ambient-bicolor-${(i + 1).toString().padStart(2, "0")}`,
                elements: newElements
            }
        });

        console.log("Added scenes");
        console.log(scenesToAdd)

        // await updateShow({
        //     name: showName,
        //     lightingPlan: lp,
        //     scenes: [
        //         ...scenes,
        //         ...scenesToAdd
        //     ]
        // })
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