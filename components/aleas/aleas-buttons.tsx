const sharedClasses = `text-center font-bold text-white
bg-gradient-to-r from-cyan-500 to-blue-500
hover:hue-rotate-15 hover:cursor-pointer 
transition duration-300`


export const AleasButton = (props: { children: string, onClick?: () => void }) => <div
    className={`
        ${sharedClasses}
        hover:scale-105
        text-xl
        py-3 px-6 min-w-[8em]
        rounded-md
    `}
    onClick={props.onClick}
>
    {props.children}
</div>

export const AleasRoundButton = (props: { children: string, onClick?: () => void }) => <div
    className={`
        ${sharedClasses}
        hover:scale-110
        text-4xl
        px-6 py-3
        rounded-full
    `}
    onClick={props.onClick}
>
    {props.children}
</div>


export default AleasButton;