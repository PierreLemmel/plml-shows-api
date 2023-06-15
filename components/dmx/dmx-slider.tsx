import { match } from "@/lib/services/core/utils";
import ReactSlider from "react-slider";
import AleasSlider from "../aleas/aleas-slider";
import DmxButton from "./dmx-button";

export type SliderType = "DmxRange"|"Percent"|"Value"

export interface DmxSliderProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    setValue: (val: number) => void;
    label?: string;
    sliderType?: SliderType;
    step?: number;
    min?: number;
    max?: number;
}

const DmxSlider = (props: DmxSliderProps) => {
    const {
        value,
        setValue,
        label,
        className,
        sliderType,
        min: minValue,
        max: maxValue,
        step,
    } = {
        sliderType: "Value" as SliderType,
        ...props
    };

    const sliderVal = match(sliderType, {
        "Percent": 100 * value,
        defaultValue: value
    });


    const setSliderVal = match(sliderType, {
        "Percent": (v: number) => setValue(v / 100),
        defaultValue: setValue
    });

    const [min, max] = match(sliderType, {
        "Value": [minValue ?? 0, maxValue ?? 100],
        "DmxRange": [0, 255],
        "Percent": [0, 100]
    });

    const widthClass = match(sliderType, {
        "DmxRange": "w-12",
        defaultValue: "w-10"
    });

    const valueLabel = match(sliderType, {
        "Percent": `${sliderVal.toFixed()}%`,
        defaultValue: sliderVal
    })

    return <div className={`${widthClass} centered-col
        bg-slate-700 rounded-md py-2
    ` + (className ?? "")}>
        <div className="text-center w-full mb-1">{valueLabel}</div>
        <AleasSlider 
            min={min}
            max={max}
            step={step}
            orientation="vertical"
            invert
            value={sliderVal}
            setValue={val => setSliderVal(val)}
            className=""
            thumbClassName=""
            trackClassName=""
        />
        {label && <div className="mt-1">{label}</div>}
        <DmxButton
            className="mt-2 w-7 h-7"
            onClick={() => setSliderVal(0)}
        >
            <svg className="full fill-slate-300/80" viewBox="0 0 1024 1024">
                <path d="M810.65984 170.65984q18.3296 0 30.49472 12.16512t12.16512 30.49472q0 18.00192-12.32896 30.33088l-268.67712 268.32896 268.67712 268.32896q12.32896 12.32896 12.32896 30.33088 0 18.3296-12.16512 30.49472t-30.49472 12.16512q-18.00192 0-30.33088-12.32896l-268.32896-268.67712-268.32896 268.67712q-12.32896 12.32896-30.33088 12.32896-18.3296 0-30.49472-12.16512t-12.16512-30.49472q0-18.00192 12.32896-30.33088l268.67712-268.32896-268.67712-268.32896q-12.32896-12.32896-12.32896-30.33088 0-18.3296 12.16512-30.49472t30.49472-12.16512q18.00192 0 30.33088 12.32896l268.32896 268.67712 268.32896-268.67712q12.32896-12.32896 30.33088-12.32896z"/>
            </svg>
        </DmxButton>
    </div>
}

export default DmxSlider;