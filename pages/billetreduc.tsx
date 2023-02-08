import { InferGetStaticPropsType } from 'next';
import { getBilletReducReviews, ReviewsData } from "@/services/billetreduc";
import { useEffect, useState } from "react";
import { randomInt } from '@/services/helpers';

export const getStaticProps = async () => {

    const reviewsData: ReviewsData = await getBilletReducReviews();

    return {
        props: {
            reviews: reviewsData.reviews
        }
    }
}

export default function BilletReduc({ reviews }: InferGetStaticPropsType<typeof getStaticProps>) {

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

    return <div className="fullscreen bg-gray-900 center-child text-gray-200 font-mono font-bold">
        <div className="flex flex-col items-center justify-between w-3/4 h-3/4 bg-slate-700/50 p-16 rounded-2xl">
            <div className="w-full h-2/3 center-child text-2xl text-center leading-relaxed">{reviews[index]}</div>
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
    className="text-center text-xl py-2 px-4 bg-gray-500 hover:brightness-125 hover:cursor-pointer transition duration-300 rounded-md min-w-[8em]"
    onClick={props.onClick}
>
    {props.children}
</div>