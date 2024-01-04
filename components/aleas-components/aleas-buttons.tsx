import { match, mergeClasses } from "@/lib/services/core/utils";
import React, { useState } from "react";
import { AleasConfirmDialog } from "./aleas-popover-inputs";

const sharedClasses = mergeClasses(
    "centered-row text-center font-bold text-white",
    "bg-gradient-to-r from-cyan-500 to-blue-500",
    "transition duration-300",
)

const enabledSharedClasses=`hover:hue-rotate-15 cursor-pointer`

const spinningSharedClasses=`cursor-progress`

const disabledSharedClasses=`brightness-50 cursor-not-allowed`

export type ButtonSize = "Normal"|"Small"

interface BaseButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    spinning?: boolean;
    size?: ButtonSize;
    onClick?: () => void;
}

export type ButtonProps = BaseButtonProps & (WithoutConfirmationOptions | WithConfirmationOptions)

type WithoutConfirmationOptions = {
    hasConfirmation?: false;
    confirmationOptions?: never;
}

type WithConfirmationOptions = {
    hasConfirmation: true;
    confirmationOptions: {
        title?: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
    }
}

const AleasBaseButton = (props: BaseButtonProps) => {
    
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
        onClick={() => {
            if (!disabled && !spinning && onClick) {
                onClick()
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

const AleasButtonWithConfirmation = (props: BaseButtonProps & WithConfirmationOptions) => {

    const {
        confirmationOptions: {
            title,
            message,
            confirmText,
            cancelText
        },
        hasConfirmation,
        onClick = () => {},
        ...buttonProps
    } = props;

    const [confirmOpen, setConfirmOpen] = useState(false);

    const onMainButtonClick = () => {
        setConfirmOpen(true);
    }

    const onConfirmButtonClick = () => {
        setConfirmOpen(false);
        onClick();
    }

    const onCancelButtonClick = () => {
        setConfirmOpen(false);
    }

    return <div>
        <AleasBaseButton
            onClick={onMainButtonClick}
            {...buttonProps}
        />
        <AleasConfirmDialog
            title={title}
            message={message}
            isOpen={confirmOpen}
            onConfirm={onConfirmButtonClick}
            onCancel={onCancelButtonClick}
            confirmText={confirmText}
            cancelText={cancelText}
        />
    </div>
}


export const AleasButton = (props: ButtonProps) => {

    const {
        hasConfirmation,
        ...restProps
    } = props;

    if (hasConfirmation) {
        return <AleasButtonWithConfirmation {...props} hasConfirmation />
    }
    else {
        return <AleasBaseButton {...restProps} />
    }
};



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
        onClick={() => {
            if (!disabled && onClick) {
                onClick()
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
    </svg>,

    "New": <svg viewBox="0 0 45.402 45.402" className="w-full h-full">
        <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141 c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27 c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435 c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/>
    </svg>,

    "Delete": <svg viewBox="0 0 482.428 482.429" className="w-full h-full">
        <g>
            <path d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098
                c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117
                h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828
                C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879
                C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096
                c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266
                c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979
                V115.744z"/>
            <path d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07
                c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"/>
            <path d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07
                c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"/>
            <path d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07
                c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"/>
        </g>
    </svg>
}

export type Icons = keyof typeof IconsSvgs;

interface BaseIconButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    size?: IconButtonSize;
    icon: Icons;
    children?: never[];
    onClick?: () => void;
}

export type IconButtonProps = BaseIconButtonProps & (WithConfirmationOptions | WithoutConfirmationOptions)

export const AleasIconButton = (props: IconButtonProps) => {
    const {
        hasConfirmation,
        ...restProps
    } = props;

    if (hasConfirmation) {
        return <AleasIconButtonWithConfirmation {...props} hasConfirmation />
    }
    else {
        return <AleasBaseIconButton {...restProps} />
    }
}

const AleasBaseIconButton = (props: BaseIconButtonProps) => {
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
                onClick()
            }
        }}
        className={mergeClasses(
            sharedClasses,
            disabled ? disabledClasses : enabledClasses,
            match(size, {
                ["Normal"]: "h-9 w-9 min-h-[2.25rem] min-w-[2.25rem] p-[0.4rem] rounded-[0.3rem]",
                ["Small"]: "h-7 w-7 p-[0.25rem] rounded-[0.2rem]",
            }),
            "fill-white",
            className
        )}>
        {IconsSvgs[icon]}
    </div>
}

const AleasIconButtonWithConfirmation = (props: BaseIconButtonProps & WithConfirmationOptions) => {
    const {
        confirmationOptions: {
            title,
            message,
            confirmText,
            cancelText
        },
        hasConfirmation,
        onClick = () => {},
        ...buttonProps
    } = props;

    const [confirmOpen, setConfirmOpen] = useState(false);

    const onMainButtonClick = () => {
        setConfirmOpen(true);
    }

    const onConfirmButtonClick = () => {
        setConfirmOpen(false);
        onClick();
    }

    const onCancelButtonClick = () => {
        setConfirmOpen(false);
    }

    return <div>
        <AleasBaseIconButton
            onClick={onMainButtonClick}
            {...buttonProps}
        />
        <AleasConfirmDialog
            title={title}
            message={message}
            isOpen={confirmOpen}
            onConfirm={onConfirmButtonClick}
            onCancel={onCancelButtonClick}
            confirmText={confirmText}
            cancelText={cancelText}
        />
    </div>
}