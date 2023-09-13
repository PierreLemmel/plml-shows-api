import { doNothing, mergeClasses } from "@/lib/services/core/utils";
import { Dispatch, InputHTMLAttributes } from "react";

interface AleasTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onValueChange?: Dispatch<string>;
}

const AleasTextField = (props: AleasTextFieldProps) => {

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
        type="text"
        className={mergeClasses(
            "w-full min-w-[8rem] px-3 py-1 rounded-md resize-none",
            "border border-gray-300 focus:outline-none focus:border-blue-500",
            "bg-slate-900/90",
            className
        )}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...restProps}
    />
}

export default AleasTextField;