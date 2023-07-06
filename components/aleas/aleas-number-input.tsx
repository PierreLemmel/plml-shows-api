import { doNothing, match, mergeClasses } from "@/lib/services/core/utils";
import { Dispatch, InputHTMLAttributes } from "react";

interface AleasNumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
    value: number;
    onValueChange?: Dispatch<number>;
    inputSize?: "Normal" | "Small";
}

const AleasNumberInput = (props: AleasNumberInputProps) => {
    
    const {
        value,
        onValueChange = doNothing,
        className,
        inputSize = "Normal",
        ...restProps
    } = props;

    return <input
        type="number"
        
        className={mergeClasses(
            "w-full px-3 py-1 rounded-md resize-none",
            "border border-gray-300 focus:outline-none focus:border-blue-500",
            "bg-slate-900/90",
            match(inputSize, { 
                "Normal": "min-w-[8em]",
                "Small": "min-w-[3em]"
            }),
            className
        )}
        min={0}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        {...restProps}
    />
}

export default AleasNumberInput;