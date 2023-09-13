import { ToastContainer, ToastContainerProps, toast as toastifyToast } from "react-toastify";

type BaseToastProps = ToastContainerProps & React.RefAttributes<HTMLDivElement>;
export type AleasToastContainerProps =  BaseToastProps & {

}

export const AleasToastContainer = (props: AleasToastContainerProps) => {

    const newProps: BaseToastProps = {
        position: "bottom-center",
        theme: 'dark',
        autoClose: 2000,
        hideProgressBar: true,
        pauseOnFocusLoss: false,
        pauseOnHover: false,
        ...props
    }

    return <ToastContainer {...newProps} />;
}

export const toast = toastifyToast;