import { useState } from "react";

export const getStaticProps = async () => {

    

    return {
        props: {}
    }
}

export default function BilletReduc() {

    const [text, setText] = useState("Le spectacle Aléas est à couper le souffle! D'abord, les performances des acteurs sont époustouflantes - ils sont vraiment bons à improviser devant des changements aléatoires de scène! De plus, le concept innovant d'utiliser le hasard pour gérer le son et la lumière est tout simplement génial!C'est presque comme si le chaos lui-même était sur scène. Bien sûr, il y a des moments où le hasard n'est pas vraiment dans nos favoris et les catastrophes se produisent, mais c'est ce qui rend le spectacle si amusant et si imprévisible! Aléas est vraiment un spectacle qui doit être vu pour être cru!");

    const onRegenerate = () => {
        console.log("Regenerate")
    }
    
    const onCopied = () => {
        console.log("Copied")
    }

    return <div className="fullscreen bg-gray-900 center-child text-gray-200 font-mono font-bold text-xl">
        <div className="flex flex-col items-center justify-between w-3/4 h-3/4 bg-slate-700/50 p-8 rounded-lg">
            <div className="w-full h-2/3 center-child">{text}</div>
            <div className="w-full flex flex-row items-center justify-around">
                <Button onClick={onRegenerate}>
                    Régénérer
                </Button>
                <Button onClick={onCopied}>
                    Copier
                </Button>
            </div>
        </div>
    </div>
}


const Button = (props: { children: string, onClick: () => void }) => <div
    className="text-center py-2 px-4 bg-gray-500 hover:brightness-125 hover:cursor-pointer transition duration-300 rounded-md min-w-[8em]"
    onClick={props.onClick}
>
    {props.children}
</div>