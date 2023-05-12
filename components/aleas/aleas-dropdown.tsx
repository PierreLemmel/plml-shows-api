import { mergeClasses } from "@/lib/services/core/utils";
import { Dispatch, useState } from "react";

const backgroundClasses = "bg-gradient-to-r from-cyan-500 to-blue-500"

const enabledClasses = `hover:hue-rotate-15 cursor-pointer`

const disabledClasses = `brightness-50`

export interface DropdownOption<T = any> {
    label: string;
    disabled?: boolean;
    value: T;
    placeholder?: string;
}

export interface DropdownProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
    options: DropdownOption<T>[];
    onSelectedOptionChanged: (option: DropdownOption<T>) => void;
}

export const AleasDropdown = (props: DropdownProps) => {

    const {
        options,
        onSelectedOptionChanged,
        placeholder,
        disabled,
    } = {
        disabled: false,
        placeholder: "Select an option",
        ...props
    };

    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<DropdownOption>();

    const handleSelectOption = (option: DropdownOption) => {
        setSelectedOption(option);
        onSelectedOptionChanged(option);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left cursor-pointer">
        <div>
            <div
                className={mergeClasses(
                    "centered-row text-center font-bold text-white",
                    backgroundClasses,
                    "transition duration-300",
                    disabled ? disabledClasses : enabledClasses,
                    "w-full rounded-md",
                    "sm:text-base",
                    "py-3 px-6 min-w-[8em]"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <svg
                    className="-mr-1 ml-2 h-5 w-5"
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
                backgroundClasses,
                "z-10 origin-top-right absolute right-0 mt-2 w-48 rounded-md")
            }>
                <div className="py-1 px-[0.1em]">
                    {options.map((option) => (
                    <div
                        key={option.value}
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