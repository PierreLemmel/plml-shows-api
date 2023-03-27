import { sequence } from "@/lib/services/core/utils";
import { useDmxWriter, useDmxWriterContext } from "@/lib/services/dmx/dmx-hooks";
import { ReactNode, useState } from "react";
import DmxButton from "./dmx-button";
import DmxSlider from "./dmx-slider";

export interface StandardConsoleProps {
    width: number;
}

const buttonsClass = "w-14 h-14 p-2 fill-slate-300/80"

const StandardConsole = (props: StandardConsoleProps) => {
    const { width } = props;

    const dmxWriter = useDmxWriterContext();

    const [startIndex, setStartIndex] = useState(0);

    const onLeftClicked = () => setStartIndex(Math.max(0, startIndex - width));
    const onRightClicked = () => setStartIndex(Math.min(511, startIndex + width));

    if (dmxWriter) {

        const { getValue, setValue } = dmxWriter;

        const sliderCount = Math.min(width, 511 - startIndex);

        return <div className="centered-row w-full gap-5">
            <DmxButton
                onClick={onLeftClicked}
                className={buttonsClass}
                disabled={startIndex <= 0}
            >
                <svg viewBox="24 0 197.402 197.402">
                    <polygon points="146.883,197.402 45.255,98.698 146.883,0 152.148,5.418 56.109,98.698 152.148,191.98"/>
                </svg>
            </DmxButton>
            <div className="centered-row w-full gap-3">
                {sequence(sliderCount, startIndex + 1).map(i => <DmxSlider
                    key={`dmx-slider-${i}`}
                    value={getValue(i)}
                    setValue={val => setValue(i, val)}
                    label={i.toString()}
                />)}
            </div>
            <DmxButton
                onClick={onRightClicked}
                className={buttonsClass}
                disabled={startIndex >= 511}
            >
               <svg viewBox="0 0 200 223.413">
                    <polygon points="57.179,223.413 51.224,217.276 159.925,111.71 51.224,6.127 57.179,0 172.189,111.71"/>
                </svg>
            </DmxButton>
        </div>
    }
    else {
        return <div>No Dmx Writer</div>
    }
}

export default StandardConsole;