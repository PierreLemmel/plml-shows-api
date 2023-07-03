import { useAuth } from "@/lib/services/api/firebase";
import { mergeClasses } from "@/lib/services/core/utils";
import { useDmxControl } from "@/lib/services/dmx/dmxControl";
import Link from "next/link";

export interface AleasNavbarProps extends React.HTMLAttributes<HTMLDivElement> {

}

const iconSize = "w-9 h-9";

const AleasNavbar = (props: AleasNavbarProps) => {

    const {
        className
    } = props;

    const { user, signInWithGoogle, signOut } = useAuth();

    const dmxControl = useDmxControl();
    const dmxState = dmxControl?.writer.state ?? "Undetected";

    const onDmxClick = () => {
        if (dmxControl) {
            
            const { canOpen, canClose, open, close } = dmxControl.writer;

            if (canOpen && open) {
                open();
            }
            else if (canClose && close) {
                close();
            }
        }
    }

    return <div className={mergeClasses(
        "w-full py-2 px-3",
        "flex flex-row items-center justify-between overflow-hidden",
        "bg-slate-800 text-white font-consolas",
        className
    )}>
        <Link href="/">
            Aléas
        </Link>
        
        <div className="flex flex-row items-center justify-center gap-6">

            {/* Dmx */}
            <div className="flex flex-row items-center justify-center gap-4">
                <svg
                    viewBox="0 0 500 500"
                    className={mergeClasses(
                        iconSize,
                        "overflow-visible",
                        "stroke-[20]",
                        dmxState === "Opened" ? "stroke-gray-700 fill-gray-300" : "stroke-gray-500 fill-gray-700",
                        (dmxState === "Opened" || dmxState === "Closed") ? "cursor-pointer" : ((dmxState === "Opening" || dmxState === "Closing") ? "cursor-progress" : "cursor-not-allowed")
                    )}
                    onClick={(dmxState === "Opened" || dmxState === "Closed") ? (() => onDmxClick()) : undefined}
                >
                    <circle className="" cx="250" cy="250" r="250" />
                    <circle className="" cx="250" cy="140" r="40" />
                    <circle className="" cx="140" cy="260" r="40" />
                    <circle className="" cx="360" cy="260" r="40" />
                </svg>
                <div className="whitespace-nowrap">DMX {dmxState}</div>
            </div>

            {/* User */}
            <div className={mergeClasses(iconSize, "cursor-pointer")}>
                { user ? <div
                    onClick={() => signOut()}
                    className="full bg-cover bg-center rounded-full"
                    style={{
                        backgroundImage:`url("${user.photoURL}")`
                    }}
                >
                    
                </div> : <div
                    onClick={() => signInWithGoogle()}
                    className="full"
                >
                    <svg viewBox="0 0 1000 1000" className="bg-white/80 rounded-full">
                        <path className="fill-gray-600" d="M500,10C231.5,10,10,231.5,10,500s221.5,490,490,490s490-221.5,490-490S768.5,10,500,10z M795.3,835.6c0-134.2-100.7-248.4-221.5-281.9c73.8-26.8,120.8-100.7,120.8-181.2c0-107.4-87.3-194.7-194.7-194.7s-194.7,87.3-194.7,194.7c0,80.5,53.7,154.4,120.8,181.2c-127.5,33.6-221.5,147.7-221.5,281.9C110.7,755.1,50.3,634.2,50.3,500C50.3,251.6,251.6,50.3,500,50.3c248.4,0,449.7,201.4,449.7,449.7C949.7,634.2,889.3,755.1,795.3,835.6z"/>
                    </svg>
                </div>}
            </div>

        </div>
        
    </div>
}

export default AleasNavbar;