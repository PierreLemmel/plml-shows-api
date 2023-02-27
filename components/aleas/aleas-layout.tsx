export interface AleasMainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    
}

export const AleasMainContainer = (props: AleasMainContainerProps) => {
    const { children } = props;

    return <div className={`flex flex-col items-center justify-between
        text-gray-200 font-mono
        rounded-2xl  bg-slate-800/80
        w-[85%] h-[92%]
        md:w-4/5 md:h-[90%]
        lg:w-3/4 lg:h-3/4
        px-12 py-6 gap-8 
    ` + (props.className ?? "")} {...props}>
        {children}
    </div>
}

export interface AleasTitleProps extends React.HTMLAttributes<HTMLDivElement> {

}

export const AleasTitle = (props: AleasTitleProps) => {
    const { children } = props;

    return <div className="
        w-full text-center my-4
        font-extrabold
        2xl:text-6xl
        lg:text-4xl
    ">
        {children}
    </div>
}