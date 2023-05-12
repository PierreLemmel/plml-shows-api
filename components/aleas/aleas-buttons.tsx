import { mergeClasses } from "@/lib/services/core/utils";

const sharedClasses = `centered-row text-center font-bold text-white
bg-gradient-to-r from-cyan-500 to-blue-500
transition duration-300`

const enabledSharedClasses=`hover:hue-rotate-15 cursor-pointer`

const spinningSharedClasses=`cursor-progress`

const disabledSharedClasses=`brightness-50 cursor-not-allowed`

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    spinning?: boolean;
}

export const AleasButton = (props: ButtonProps) => {
    
    const {
        disabled,
        spinning,
        children,
        onClick
    } = {
        disabled: false,
        spinning: false,
        ...props
    }
    
    const enabledClasses = enabledSharedClasses + 'hover:scale-105';
    const spinningClasses = spinningSharedClasses;
    const disabledClasses = disabledSharedClasses;

    return <div
        {...props}
        onClick={e => {
            if (!disabled && onClick) {
                onClick(e)
            }
        }}
        className={mergeClasses(
            sharedClasses,
            disabled ? disabledClasses : (spinning ? spinningClasses : enabledClasses),
            "sm:text-base md:text-xl xl:text-2xl",
            "py-3 px-6 min-w-[8em]",
            "rounded-md",
            props.className
        )}
    >
        {spinning ? <svg className="animate-spin h-5 w-5 -ml-1 mr-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg> : 
        children}
    </div>
}

export const AleasRoundButton = (props: ButtonProps) => {

    const { disabled, onClick } = {
        disabled: false,
        ...props
    }
    
    const enabledClasses = enabledSharedClasses + 'hover:scale-110';
    const disabledClasses = disabledSharedClasses;

    return <div
        {...props}
        onClick={e => {
            if (!disabled && onClick) {
                onClick(e)
            }
        }}
        className={mergeClasses(
            sharedClasses,
            disabled ? disabledClasses : enabledClasses,
            "sm:text-[1.35rem] sm:px-[0.95rem] sm:py-1",
            "md:text-2xl md:px-5 md:py-2",
            "xl:text-4xl xl:px-6 xl:py-3",
            "rounded-full",
            props.className
        )}
    />
}