export interface DmxButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
}


const enabledClasses = "hover:brightness-90 active:brightness-75 cursor-pointer transition-all duration-100";
const disabledClasses = "brightness-50";

const DmxButton = (props: DmxButtonProps) => {
    const { onClick, children, className, disabled } = {
        disabled: false,
        ...props
    };

    return <div className={`
            center-child text-center rounded p-[0.15rem]
            bg-slate-500 
        `+ (className ?? "") + " "
        + (disabled ? disabledClasses : enabledClasses)}
        onClick={onClick}
    >
        {children}
    </div>
}

export default DmxButton;