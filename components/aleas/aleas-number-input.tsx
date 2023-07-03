import { doNothing, mergeClasses } from "@/lib/services/core/utils";
import { Dispatch, InputHTMLAttributes } from "react";

interface AleasNumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
    value: number;
    onValueChange?: Dispatch<number>;
}

const AleasNumberInput = (props: AleasNumberInputProps) => {
    
    const {
        value,
        onValueChange,
        className,
        ...restProps
    } = {
        onValueChange: doNothing,
        ...props
    };

    return <input
        type="number"
        
        className={mergeClasses(
            "w-full min-w-[8rem] px-3 py-1 rounded-md resize-none",
            "border border-gray-300 focus:outline-none focus:border-blue-500",
            "bg-slate-900/90",
            className
        )}
        min={0}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        {...restProps}
    />
}

export default AleasNumberInput;