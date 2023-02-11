import { InferGetStaticPropsType } from 'next';
import { getBilletReducReviews, getBilletReducSettings, ReviewsData } from "@/lib/services/billetreduc";
import { useEffect, useState } from "react";
import { randomInt } from '@/lib/services/helpers';

export const getStaticProps = async () => {

    const { reviews } = await getBilletReducReviews();
    const { billetReducUrl } = await getBilletReducSettings();

    return {
        props: {
            reviews,
            billetReducUrl
        }
    }
}

export default function BilletReduc(props: InferGetStaticPropsType<typeof getStaticProps>) {

    const { reviews, billetReducUrl } = props;

    const [index, setIndex] = useState<number>(0);

    const onRegenerate = () => {
        
        let newIndex = index;
        while (newIndex === index) {
            newIndex = randomInt(0, reviews.length - 1);
        }

        setIndex(newIndex);
    }
    
    useEffect(onRegenerate, []);

    const onCopied = () => {
        console.log("Copied")
    }

    const onAddToBR = () => {
        console.log(billetReducUrl)
    }

    return <div className={`fullscreen center-child
        bg-gradient-to-r from-gray-900 to-gray-800
        text-gray-200 font-mono
    `}>
        <div className="flex flex-col items-center justify-between w-3/4 h-3/4 bg-slate-700/50 p-12 rounded-2xl">
            <div className="w-full h-2/3 center-child text-2xl text-center leading-relaxed">{reviews[index]}</div>
            <div className="w-full flex flex-row items-center justify-around">
                <Button onClick={onRegenerate}>
                    Régénérer
                </Button>
                <Button onClick={onCopied}>
                    Copier
                </Button>
                <a target="_blank" href={billetReducUrl} rel="noopener noreferrer">
                    <Button onClick={onAddToBR}>
                        Sur BilletReduc
                    </Button>
                </a>
            </div>
        </div>
    </div>
}


const Button = (props: { children: string, onClick: () => void }) => <div
    className={`
        text-center text-xl font-bold
        py-3 px-6 min-w-[8em]
        bg-gradient-to-r from-cyan-500 to-blue-500
        hover:hue-rotate-30 hover:cursor-pointer
        transition duration-300 rounded-md
    `}
    onClick={props.onClick}
>
    {props.children}
</div>