const sharedClasses = `text-center font-bold text-white
bg-gradient-to-r from-cyan-500 to-blue-500
hover:hue-rotate-15 hover:cursor-pointer 
transition duration-300`

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {

}

export const AleasButton = (props: ButtonProps) => <div
    className={`
        ${sharedClasses}
        hover:scale-105
        sm:text-base
        md:text-xl
        xl:text-2xl
        py-3 px-6 min-w-[8em]
        rounded-md
        ${props.className ?? ""}
    `}
    {...props}
/>

export const AleasRoundButton = (props: ButtonProps) => <div
    className={`
        ${sharedClasses}
        hover:scale-110
        sm:text-[1.35rem] sm:px-[0.95rem] sm:py-1
        md:text-2xl md:px-5 md:py-2
        xl:text-4xl xl:px-6 xl:py-3
        rounded-full
        ${props.className ?? ""}
    `}
    {...props}
/>


export default AleasButton;