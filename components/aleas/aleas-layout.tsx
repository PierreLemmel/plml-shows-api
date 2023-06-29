import { mergeClasses } from "@/lib/services/core/utils";
import AleasBackground from "./aleas-background";
import AleasHead from "./aleas-head";
import AleasNavbar from "./aleas-navbar";
import { AleasToastContainer } from "./aleas-toast-container";

export interface AleasMainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    overflow?: boolean;
}

export const AleasMainContainer = (props: AleasMainContainerProps) => {
    const {
        children,
        overflow,
        className,
        ...restProps
    } = props;

    return <div className={mergeClasses(
            "bg-slate-800/80",
            "text-gray-200 font-mono",
            "w-full h-full",
            className,
            overflow && "overflow-y-auto",
        )}
        {...restProps}
    >
        <div className={mergeClasses(
            "flex flex-col items-center justify-between",
            "full",
            "sm:px-5 sm:py-3 sm:gap-4",
            "md:px-12 md:py-6 md:gap-8",
            "lg:px-12 lg:py-6 lg:gap-8",
            "no-scrollbar",
        )}>
            {children}
        </div>
    </div>
}

export const AleasModalContainer = (props: AleasMainContainerProps) => {
    const {
        children,
        overflow,
        className,
        ...restProps
    } = props;

    return <div className={mergeClasses(
            "flex flex-col items-center justify-between",
            "bg-slate-800/80",
            "text-gray-200 font-mono",
            "sm:rounded-2xl md:rounded-[1.5rem]",
            "w-[85%] h-[92%]",
            "md:w-[85%] md:h-[90%]",
            "lg:w-4/5 lg:h-4/5",
            "xl:w-3/4 xl:h-4/5",
            "sm:px-5 sm:py-3 sm:gap-4",
            "md:px-12 md:py-6 md:gap-8 ",
            "lg:px-12 lg:py-6 lg:gap-8 ",
            className,
            overflow && "overflow-y-auto"
        )}
        {...restProps}
    >
        {children}
    </div>
}

const CoreLayoutContainer = (props: { modal: boolean} & AleasMainContainerProps) => {
    const { modal, ...restProps } = props;

    return modal ? 
        <AleasModalContainer {...restProps} overflow>
            {props.children}
        </AleasModalContainer> :
        <AleasMainContainer {...restProps} overflow>
            {props.children}
        </AleasMainContainer>
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
    titleDisplay?: boolean;
    description?: string;
    navbar?: boolean;
    toasts?: boolean;
    modal?: boolean;
}

export const AleasMainLayout = (props: AleasLayoutProps) => {
    const {
        children,
        title,
        titleDisplay,
        description,
        navbar,
        toasts,
        modal,
        className,
        ...restProps
     } = {
        navbar: true,
        titleDisplay: true,
        toasts: false,
        modal: false,
        ...props
     };

    return <>
        <AleasHead {...{title, description}} />

        <main className={mergeClasses(
            "fullscreen relative overflow-hidden",
            className, 
        )} {...restProps}>
            <AleasBackground />

            <div className="fullscreen absolute top-0 left-0 flex flex-col">
                {navbar && <AleasNavbar />}

                <div
                    className="w-full center-child flex-grow"
                >
                    <CoreLayoutContainer modal={modal}>
                        {titleDisplay && title && <AleasTitle>
                            {title}
                        </AleasTitle>}

                        <div className="flex flex-col justify-evenly items-center flex-grow w-full">
                            {children}
                        </div>

                    </CoreLayoutContainer>

                </div>
            </div>

            {toasts && <AleasToastContainer />}
            
        </main>
    </>
}