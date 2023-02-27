export interface AleasMainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    
}

export const AleasMainContainer = (props: AleasMainContainerProps) => {
    const { children } = props;

    return <div className={`flex flex-col items-center justify-between
        bg-slate-800/80    
        text-gray-200 font-mono
        sm:rounded-2xl md:rounded-[2rem] lg:rounded-[3rem]
        w-[85%] h-[92%]
        md:w-4/5 md:h-[90%]
        lg:w-3/4 lg:h-3/4
        sm:px-5 sm:py-3 sm:gap-4
        md:px-12 md:py-6 md:gap-8 
        lg:px-12 lg:py-6 lg:gap-8 
    ` + (props.className ?? "")} {...props}>
        {children}
    </div>
}

export interface AleasTitleProps extends React.HTMLAttributes<HTMLDivElement> {

}

export const AleasTitle = (props: AleasTitleProps) => {
    const { children } = props;

    return <div className="
        w-full text-center
        sm:my-2
        md:my-2
        lg:my-4
        font-extrabold
        sm:text-xl
        md:text-3xl
        lg:text-4xl
        2xl:text-6xl
    ">
        {children}
    </div>
}