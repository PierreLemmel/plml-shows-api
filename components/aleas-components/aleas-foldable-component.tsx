import { mergeClasses } from "@/lib/services/core/utils";
import { useState } from "react";

export interface AleasFoldableComponentProps extends React.HTMLAttributes<HTMLDivElement>{
    title: string;
    extraInfo?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    containerClassName?: string;
}

const AleasFoldableComponent = (props: AleasFoldableComponentProps) => {
    const {
        title,
        extraInfo,
        children,
        defaultOpen = false,
        className,
        containerClassName,
        ...restProps
    } = props;
    const [isOpen, setIsOpen] = useState(false);

    return <div className={mergeClasses(
        "w-full flex flex-col items-center justify-between",
        className
    )} {...restProps}
    >
        <div className={mergeClasses(
            "w-full flex flex-row justify-between",
            "p-2 bg-slate-800/80 rounded-t-md",
            isOpen ? "" : "rounded-b-md",
            "hover:cursor-pointer"
        )}
            onClick={() => setIsOpen(!isOpen)}    
        >
            <div>
                {title}
                {extraInfo && <span className="text-xs pl-2"> {extraInfo}</span>}
            </div>
            <div className="h-6 w-6">
                <svg
                    className={mergeClasses(
                        "full",
                        isOpen && "-scale-y-100",
                        "transition-transform duration-300 ease-in-out"
                    )}
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

        {isOpen && <div className={mergeClasses(
            "w-full py-3 px-4 rounded-b-md",
            "bg-slate-800/60"
        )}>
            <div className={mergeClasses(
                "w-full h-full",
                containerClassName
            )}>{children}</div>
        </div>}
    </div>
}

export default AleasFoldableComponent;