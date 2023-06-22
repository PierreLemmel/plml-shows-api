export interface DmxToggleProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    toggled: boolean;
}


const enabledClasses = "hover:brightness-90 active:brightness-75 cursor-pointer transition-all duration-100";
const toggledClass = "border-solid border-2 border-sky-500 brightness-[0.85]";
const disabledClasses = "brightness-50";

const DmxToggle = (props: DmxToggleProps) => {
    const { onClick, children, className, toggled, disabled } = {
        disabled: false,
        ...props
    };

    return <div className={`
            center-child text-center rounded-lg p-[0.15rem]
            bg-slate-500
            w-14 h-14
        `+ (className ?? "") + " "
        + (disabled ? disabledClasses : enabledClasses) + " "
        + (toggled && toggledClass)}
        onClick={onClick}
    >
        {children}
    </div>
}

export default DmxToggle;