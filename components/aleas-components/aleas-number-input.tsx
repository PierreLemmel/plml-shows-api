import { doNothing, match, mergeClasses } from "@/lib/services/core/utils";
import { Dispatch, InputHTMLAttributes } from "react";

interface AleasNumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
    value: number;
    onValueChange?: Dispatch<number>;
    inputSize?: "Normal" | "Small" | "Tiny";
    min?: number;
    max?: number;
}

const AleasNumberInput = (props: AleasNumberInputProps) => {
    
    const {
        value,
        onValueChange = doNothing,
        className,
        inputSize = "Normal",
        min = 0,
        max = undefined,
        ...restProps
    } = props;

    return <input
        type="number"
        
        className={mergeClasses(
            "px-3 py-1 rounded-md resize-none",
            "border border-gray-300 focus:outline-none focus:border-blue-500",
            "bg-slate-900/90",
            match(inputSize, { 
                "Normal": "w-full min-w-[8em]",
                "Small": "w-full min-w-[3em]",
                "Tiny": "w-[4.2em]"
            }),
            className
        )}
        onChange={(e) => onValueChange(Number(e.target.value))}
        min={min}
        max={max}
        value={value}
        {...restProps}
    />
}

export default AleasNumberInput;