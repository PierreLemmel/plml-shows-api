import { match, mergeClasses } from "@/lib/services/core/utils";
import ReactSlider from "react-slider";


export interface AleasSliderProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    setValue: (val: number) => void;
    label?: string;
    orientation: "horizontal"|"vertical"
    step?: number;
    min?: number;
    max?: number;
    invert?: boolean;
    thumbClassName?: string;
    trackClassName?: string;
}

const AleasSlider = (props: AleasSliderProps) =>{
    const {
        min,
        max,
        step,
        value,
        setValue,
        orientation,
        invert,
        className,
        thumbClassName,
        trackClassName
    } = props;

    return <ReactSlider
        min={min}
        max={max}
        step={step}
        orientation={orientation}
        invert={invert}
        value={value}
        onChange={val => setValue(val)}
        className={mergeClasses(
            match(orientation, {
                "horizontal": "h-2 w-full min-w-[12rem]",
                "vertical": "w-2 h-full min-h-[12rem]"
            }),
            "bg-slate-500 rounded-md cursor-pointer",
            className
        )}
        thumbClassName={mergeClasses(
            match(orientation, {
                "horizontal": "-top-1",
                "vertical": "-left-1"
            }),
            "w-4 h-4 bg-blue-600",
            "rounded-full hover:scale-200 outline-none cursor-pointer",
            "active:bg-blue-700 active:scale-105",
            "hover:scale-105",
            "transition-colors duration-300",
            thumbClassName
        )}
        trackClassName={mergeClasses(
            "bg-blue-600 cursor-pointer",
            trackClassName
        )}
    />
}

export default AleasSlider;