import AleasBackground from "./aleas-background";
import AleasHead from "./aleas-head";
import AleasNavbar from "./aleas-navbar";

export interface AleasMainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    overflow?: boolean;
}

export const AleasMainContainer = (props: AleasMainContainerProps) => {
    const { children, overflow } = props;

    return <div className={`flex flex-col items-center justify-between
        bg-slate-800/80    
        text-gray-200 font-mono
        sm:rounded-2xl md:rounded-[1.5rem]
        w-[85%] h-[92%]
        md:w-[85%] md:h-[90%]
        lg:w-4/5 lg:h-4/5
        xl:w-3/4 xl:h-4/5
        sm:px-5 sm:py-3 sm:gap-4
        md:px-12 md:py-6 md:gap-8 
        lg:px-12 lg:py-6 lg:gap-8 
    ` + (props.className ?? "")
    + (overflow ? "overflow-y-auto" : "")} {...props}>
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

export interface AleasLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
}

export const AleasMainLayout = (props: AleasLayoutProps) => {
    const {
        children,
        title,
        description
     } = props;

    return <>
        <AleasHead {...{title, description}} />

        <main className="fullscreen relative overflow-hidden">
            <AleasBackground />

            <AleasNavbar />

            <div
                className="absolute top-0 left-0 full center-child"
            >
                <AleasMainContainer>

                    {title && <AleasTitle>
                        {title}
                    </AleasTitle>}

                    <div className="flex flex-col justify-evenly items-center flex-grow">
                        {children}
                    </div>

                </AleasMainContainer>

            </div>

            

            
        </main>
    </>
}