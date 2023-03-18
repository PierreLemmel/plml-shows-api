const sharedClasses = `text-center font-bold text-white
bg-gradient-to-r from-cyan-500 to-blue-500
transition duration-300`

const enabledSharedClasses=`hover:hue-rotate-15 hover:cursor-pointer `

const disabledSharedClasses=`brightness-50`

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean
}

export const AleasButton = (props: ButtonProps) => {
    
    const { disabled, onClick } = {
        disabled: false,
        ...props
    }
    
    const enabledClasses = enabledSharedClasses + 'hover:scale-105';
    const disabledClasses = disabledSharedClasses;

    return <div
        {...props}
        onClick={e => {
            if (!disabled && onClick) {
                onClick(e)
            }
        }}
        className={`
            ${sharedClasses}
            ${disabled ? disabledClasses : enabledClasses}
            sm:text-base
            md:text-xl
            xl:text-2xl
            py-3 px-6 min-w-[8em]
            rounded-md
            ${props.className ?? ""}
        `}
    />
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
        className={`
            ${sharedClasses}
            ${disabled ? disabledClasses : enabledClasses}
            sm:text-[1.35rem] sm:px-[0.95rem] sm:py-1
            md:text-2xl md:px-5 md:py-2
            xl:text-4xl xl:px-6 xl:py-3
            rounded-full
            ${props.className ?? ""}
        `}
    />
}