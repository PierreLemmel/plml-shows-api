import { match, mergeClasses } from "@/lib/services/core/utils";
import React from "react";

const sharedClasses = mergeClasses(
    "centered-row text-center font-bold text-white",
    "bg-gradient-to-r from-cyan-500 to-blue-500",
    "transition duration-300",
)

const enabledSharedClasses=`hover:hue-rotate-15 cursor-pointer`

const spinningSharedClasses=`cursor-progress`

const disabledSharedClasses=`brightness-50 cursor-not-allowed`

export type ButtonSize = "Normal"|"Small"

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    spinning?: boolean;
    size?: ButtonSize;
}

export const AleasButton = (props: ButtonProps) => {
    
    const {
        disabled = false,
        spinning = false,
        children,
        className,
        onClick,
        size = "Normal",
        ...restProps
    } = props;
    
    const enabledClasses = mergeClasses(enabledSharedClasses, 'hover:scale-105');
    const spinningClasses = spinningSharedClasses;
    const disabledClasses = disabledSharedClasses;

    return <div
        {...restProps}
        onClick={e => {
            if (!disabled && !spinning && onClick) {
                onClick(e)
            }
        }}
        className={mergeClasses(
            sharedClasses,
            disabled === true ? disabledClasses : (spinning === true ? spinningClasses : enabledClasses),
            match(size, {
                ["Normal"]: mergeClasses(
                    "py-3 px-6 min-w-[8em]",
                    "sm:text-base md:text-xl xl:text-2xl",
                ),
                ["Small"]: mergeClasses(
                    "py-1 px-2 min-w-[6em]",
                    "sm:text-sm md:text-base xl:text-xl",
                )
            }),
            "rounded-md",
            className
        )}
    >
        {spinning ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg> : 
        children}
    </div>
}

export const AleasRoundButton = (props: ButtonProps) => {

    const {
        disabled = false,
        onClick,
        ...restProps
    } = props
    
    const enabledClasses = enabledSharedClasses + 'hover:scale-110';
    const disabledClasses = disabledSharedClasses;

    return <div
        {...restProps}
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


export type IconButtonSize = "Normal"|"Small";

const IconsSvgs = {
    "Edit": <svg viewBox="0 0 121.48 122.88" className="w-full h-full" style={{fillRule: "evenodd", clipRule: "evenodd"}}>
        <path d="M96.84,2.22l22.42,22.42c2.96,2.96,2.96,7.8,0,10.76l-12.4,12.4L73.68,14.62l12.4-12.4 C89.04-0.74,93.88-0.74,96.84,2.22L96.84,2.22z M70.18,52.19L70.18,52.19l0,0.01c0.92,0.92,1.38,2.14,1.38,3.34 c0,1.2-0.46,2.41-1.38,3.34v0.01l-0.01,0.01L40.09,88.99l0,0h-0.01c-0.26,0.26-0.55,0.48-0.84,0.67h-0.01 c-0.3,0.19-0.61,0.34-0.93,0.45c-1.66,0.58-3.59,0.2-4.91-1.12h-0.01l0,0v-0.01c-0.26-0.26-0.48-0.55-0.67-0.84v-0.01 c-0.19-0.3-0.34-0.61-0.45-0.93c-0.58-1.66-0.2-3.59,1.11-4.91v-0.01l30.09-30.09l0,0h0.01c0.92-0.92,2.14-1.38,3.34-1.38 c1.2,0,2.41,0.46,3.34,1.38L70.18,52.19L70.18,52.19L70.18,52.19z M45.48,109.11c-8.98,2.78-17.95,5.55-26.93,8.33 C-2.55,123.97-2.46,128.32,3.3,108l9.07-32v0l-0.03-0.03L67.4,20.9l33.18,33.18l-55.07,55.07L45.48,109.11L45.48,109.11z M18.03,81.66l21.79,21.79c-5.9,1.82-11.8,3.64-17.69,5.45c-13.86,4.27-13.8,7.13-10.03-6.22L18.03,81.66L18.03,81.66z"/>
    </svg>
}

export type Icons = keyof typeof IconsSvgs;

interface IconButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    size?: IconButtonSize;
    icon: Icons;
    children?: never[];
}


export const AleasIconButton = (props: IconButtonProps) => {
    const {
        disabled = false,
        children,
        className,
        size = "Normal",
        onClick,
        icon,
        ...restProps
    } = props;

    const enabledClasses = mergeClasses(enabledSharedClasses, 'hover:scale-105');
    const disabledClasses = disabledSharedClasses;

    return <div
        {...restProps}
        onClick={e => {
            if (!disabled && onClick) {
                onClick(e)
            }
        }}
        className={mergeClasses(
            sharedClasses,
            disabled ? disabledClasses : enabledClasses,
            match(size, {
                ["Normal"]: "h-9 w-9 p-[0.4rem] rounded-[0.3rem]",
                ["Small"]: "h-7 w-7 p-[0.25rem] rounded-[0.2rem]",
            }),
            "fill-white",
            className
        )}>
        {IconsSvgs[icon]}
    </div>
}