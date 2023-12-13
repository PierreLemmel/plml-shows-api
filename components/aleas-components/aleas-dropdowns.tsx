import { match, mergeClasses } from "@/lib/services/core/utils";
import { useEffect, useState } from "react";

const btnBackgroundClasses = "bg-gradient-to-r from-cyan-500 to-blue-500"
const btnEnabledClasses = `hover:hue-rotate-15 cursor-pointer`
const btnDisabledClasses = `brightness-50`

export type DropDownSize = "Normal"|"Small";

export interface DropdownOption<T = any> {
    label: string;
    disabled?: boolean;
    value: T;
}

export interface DropdownProps<T = any, TKey = any> extends React.HTMLAttributes<HTMLDivElement> {
    options: DropdownOption<T>[];
    value?: T;
    idFunction?: (t: T) => TKey; 
    onValueChanged: (newValue: T) => void;
    size?: DropDownSize;
    disabled?: boolean;
    placeholder?: string;
}

export const AleasDropdownButton = (props: DropdownProps) => {

    const {
        options,
        onValueChanged,
        placeholder = "Select an option",
        disabled = false,
        idFunction = (t) => t,
        value,
        size = "Normal"
    } = props;

    const [isOpen, setIsOpen] = useState(false);

    const handleSelectOption = (option: DropdownOption) => {
        setSelectedOption(option);
        onValueChanged(option.value);
        setIsOpen(false);
    };

    const [selectedOption, setSelectedOption] = useState<DropdownOption>();
    useEffect(() => {

        const option = options.find(o => idFunction(o.value) === idFunction(value));
        if (option) {
            setSelectedOption(option);
        }
        else {
            setSelectedOption(undefined);
        }

    }, [options, value]);

    return (
        <div className="relative inline-block text-left cursor-pointer">
        <div>
            <div
                className={mergeClasses(
                    "centered-row text-center font-bold text-white",
                    btnBackgroundClasses,
                    "transition duration-300",
                    disabled ? btnDisabledClasses : btnEnabledClasses,
                    "w-full rounded-md",
                    "sm:text-base",
                    match(size, {
                        "Small": "py-2 px-4 min-w-[6em] text-sm",
                        "Normal": "py-3 px-6 min-w-[8em] text-base",
                    })
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <svg
                    className={mergeClasses(
                        "-mr-1 ml-2 h-5 w-5",
                        isOpen && "-scale-y-100",
                        "transition-transform duration-300 ease-in-out"
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </div>

        {isOpen && (
            <div className={mergeClasses(
                btnBackgroundClasses,
                "z-10 origin-top-right absolute right-0 mt-2 min-w-48 w-full rounded-md")
            }>
                <div className="py-1 px-[0.1em] max-h-48 overflow-y-auto">
                    {options.map((option, i) => (
                    <div
                        key={i}
                        className={mergeClasses(
                            "w-full text-left px-4 py-2",
                            "hover:brightness-125 hover:bg-indigo-500/40 rounded-md"
                        )}
                        onClick={() => handleSelectOption(option)}
                    >
                        {option.label}
                    </div>
                    ))}
                </div>
            </div>
        )}
        </div>
    );
};



const inputBackgroundClasses = "bg-slate-900 border border-gray-300 focus:outline-none focus:border-blue-500"
const inputEnabledClasses = `hover:hue-rotate-15 cursor-pointer`
const inputDisabledClasses = `brightness-50`

export const AleasDropdownInput = (props: DropdownProps) => {

    const {
        options,
        onValueChanged,
        placeholder = "Select an option",
        disabled = false,
        className,
        value
    } = props;

    const [isOpen, setIsOpen] = useState(false);

    const [selectedOption, setSelectedOption] = useState<DropdownOption>();
    useEffect(() => {

        const option = options.find(o => o.value === value);
        if (option) {
            setSelectedOption(option);
        }
        else {
            setSelectedOption(undefined);
        }

    }, [options, value]);


    const handleSelectOption = (option: DropdownOption) => {
        onValueChanged(option.value);
        setIsOpen(false);
        setSelectedOption(option);
    };

    return (
        <div className={mergeClasses(
            "relative inline-block text-left cursor-pointer",
            "w-full min-w-[8rem]",
            className
        )}>
            <div
                className={mergeClasses(
                    "flex flex-row justify-between items-center",
                    "text-center font-bold text-white",
                    inputBackgroundClasses,
                    "transition duration-300",
                    disabled ? inputDisabledClasses : inputEnabledClasses,
                    "w-full rounded-md",
                    "sm:text-base",
                    "px-3 py-2 "
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
            {selectedOption ? selectedOption.label : placeholder}
            <svg
                className={mergeClasses(
                    "-mr-1 ml-2 h-5 w-5",
                    isOpen && "-scale-y-100",
                    "transition-transform duration-300 ease-in-out"
                )}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                />
            </svg>
        </div>

        {isOpen && (
            <div className={mergeClasses(
                inputBackgroundClasses,
                "z-10 origin-top-right absolute right-0 mt-2 w-full rounded-md")
            }>
                <div className="py-1 px-[0.1em]">
                    {options.map((option, i) => (
                    <div
                        key={i}
                        className={mergeClasses(
                            "w-full text-left px-4 py-2",
                            "max-h-48 overflow-y-auto",
                            "hover:brightness-125 hover:bg-indigo-500/40 rounded-md"
                        )}
                        onClick={() => handleSelectOption(option)}
                    >
                        {option.label}
                    </div>
                    ))}
                </div>
            </div>
        )}
    </div>);
};