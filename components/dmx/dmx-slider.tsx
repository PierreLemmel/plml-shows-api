import ReactSlider from "react-slider";
import DmxButton from "./dmx-button";

export type SliderType = "Value"|"Percent"

export interface DmxSliderProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    setValue: (val: number) => void;
    label?: string;
    sliderType?: SliderType;
}

const DmxSlider = (props: DmxSliderProps) => {
    const {
        value,
        setValue,
        label,
        className,
        sliderType
    } = {
        sliderType: "Value",
        ...props
    };

    const valueSlider = sliderType === "Value";

    const sliderVal = valueSlider ? value : 100 * value;
    const setSliderVal = valueSlider ? setValue : (v: number) => setValue(v / 100)

    const [min, max] = valueSlider ? [0, 255]: [0, 100]
    const valueLabel = valueSlider ? sliderVal : `${sliderVal.toFixed()}%`
    const widthClass = valueSlider ? "w-10" : "w-12";


    return <div className={`${widthClass} centered-col
        bg-slate-700 rounded-md py-2
    ` + (className ?? "")}>
        <div className="text-center w-full mb-1">{valueLabel}</div>
        <ReactSlider
            min={min}
            max={max}
            orientation="vertical"
            invert
            value={sliderVal}
            onChange={val => setSliderVal(val)}
            className="w-2 h-full min-h-[12rem] bg-slate-500 rounded-md cursor-pointer"
            thumbClassName="w-4 h-4 -left-1 bg-blue-600
                rounded-full hover:scale-200 outline-none cursor-pointer
                active:bg-blue-700 active:scale-105
                hover:scale-105
                transition-colors duration-300
            "
            trackClassName="bg-blue-600 cursor-pointer"
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