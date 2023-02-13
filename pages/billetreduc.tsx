import { InferGetStaticPropsType } from 'next';
import { getBilletReducReviews, getBilletReducSettings } from "@/lib/services/billetreduc";
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
    const review = reviews[index];

    const onRegenerate = () => {
        
        let newIndex = index;
        while (newIndex === index) {
            newIndex = randomInt(0, reviews.length - 1);
        }

        setIndex(newIndex);
    }
    
    const codeString = `using System;
    using UnityEngine;

    namespace Plml.Shows
    {
        public class RngShow
        {
            public void Update()
            {
                Debug.Log("Hello world!");
            }
        }
    }`;

    useEffect(onRegenerate, []);

    const onCopied = () => {
        navigator.clipboard.writeText(review)
    }

    return <div className="fullscreen relative">
        <div className="
            full absolute top-0  center-child
            bg-gradient-to-r from-gray-900 to-gray-800
        ">

            {/* <SyntaxHighlighter language="javascript" style={dracula}>
                {codeString}
            </SyntaxHighlighter> */}
        </div>
        <div className="full absolute top-0 center-child
            text-gray-200 font-mono
        ">
            <div className="flex flex-col items-center justify-between
                rounded-2xl w-3/4 h-3/4 bg-slate-700/50
                px-12 py-6 gap-8
            ">
                <div className="
                    w-full text-center my-4
                    text-6xl font-extrabold
                ">
                    Générateur de critiques aléatoires
                </div>
                <div className="
                    w-full center-child italic text-center overflow-y-auto overflow-x-visible
                    max-h-[66%]
                    text-2xl leading-relaxed
                ">
                    {review}
                </div>
                <div className="
                    w-full flex flex-row items-center justify-around
                ">
                    <Button onClick={onRegenerate}>
                        Une autre !
                    </Button>
                    <Button onClick={onCopied}>
                        Copier
                    </Button>
                    <a target="_blank" href={billetReducUrl} rel="noopener noreferrer">
                        <Button>
                            BilletReduc
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    </div>
}


const Button = (props: { children: string, onClick?: () => void }) => <div
    className={`
        text-center text-xl font-bold
        py-3 px-6 min-w-[8em]
        bg-gradient-to-r from-cyan-500 to-blue-500
        hover:hue-rotate-30 hover:cursor-pointer hover:scale-105
        transition duration-300 rounded-md
    `}
    onClick={props.onClick}
>
    {props.children}
</div>