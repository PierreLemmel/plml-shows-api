import { InferGetStaticPropsType } from 'next';
import { getBilletReducReviews, getBilletReducSettings } from "@/lib/services/billetreduc";
import { useEffect, useRef, useState } from "react";
import { randomInt, } from '@/lib/services/helpers';
import { motion } from 'framer-motion';
import AleasBackground from '@/components/aleas/aleas-background';
import AleasButton, { AleasRoundButton } from '@/components/aleas/aleas-buttons';
import Link from 'next/link';

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
    const [fadeIn, setFadeIn] = useState<boolean>(true);
    const fadeTimeout = useRef<NodeJS.Timeout|undefined>(undefined);

    const [showHelp, setShowHelp] = useState<boolean>(false);

    const fadeDuration = 0.4;

    const review = reviews[index];

    const onRegenerate = () => {
        
        setFadeIn(false);
        fadeTimeout.current = setTimeout(() => {
            let newIndex = index;
            while (newIndex === index) {
                newIndex = randomInt(0, reviews.length - 1);
            }

            setIndex(newIndex);
            setFadeIn(true);
        }, fadeDuration * 1000)
        
    }

    useEffect(onRegenerate, []);

    const onCopied = () => {
        navigator.clipboard.writeText(review)
    }

    return <div className="fullscreen relative overflow-hidden">
        <AleasBackground />
        <div className="full absolute top-0 center-child
            text-gray-200 font-mono
        ">
            <div className="flex flex-col items-center justify-between
                rounded-2xl  bg-slate-800/80
                w-[85%] h-[92%]
                md:w-4/5 md:h-[90%]
                lg:w-3/4 lg:h-3/4
                px-12 py-6 gap-8
            ">
                <div className="
                    w-full text-center my-4
                    font-extrabold
                    2xl:text-6xl
                    lg:text-4xl
                ">
                    Générateur de critiques aléatoires
                </div>
                <motion.div
                    className="
                        w-full center-child italic text-center overflow-y-auto overflow-x-visible
                        max-h-[66%]
                        text-xl leading-normal
                        lg:text-xl
                        2xl:text-2xl 2xl:leading-relaxed
                    "
                    animate={{
                        opacity: fadeIn ? 1 : 0
                    }}
                    initial={{
                        opacity: 0
                    }}
                    transition={{
                        duration: fadeDuration,
                        type: "spring"
                    }}
                >
                    {review}
                </motion.div>
                <div className="
                    w-full flex flex-row items-center justify-around
                ">
                    <AleasButton onClick={onRegenerate}>
                        Une autre !
                    </AleasButton>
                    <AleasButton onClick={onCopied}>
                        Copier
                    </AleasButton>
                    <a target="_blank" href={billetReducUrl} rel="noopener noreferrer">
                        <AleasButton>
                            BilletReduc
                        </AleasButton>
                    </a>
                </div>
            </div>
        </div>
        <div className="absolute bottom-8 right-8">
            <AleasRoundButton onClick={() => setShowHelp(true)}>
                ?
            </AleasRoundButton>
        </div>
        <motion.div
            className="absolute top-0 left-0 full center-child"
            variants={{
                show: {
                    scale: 1,
                    opacity: 1
                },
                hide: {
                    scale: 0,
                    opacity: .2
                }
            }}
            animate={showHelp ? "show" : "hide"}
            initial="hide"
            transition={{
                duration: showHelp ? 0.8 : 1.1,
                type: 'spring'
            }}
            onClick={() => setShowHelp(false)}
        >
            <div className="flex flex-col items-center justify-between
                text-gray-200 font-mono
                rounded-2xl  bg-slate-800
                w-[85%] h-[92%]
                md:w-4/5 md:h-[90%]
                lg:w-3/4 lg:h-3/4
                px-[4rem] py-6 gap-8
            "
                onClick={e => e.stopPropagation()}
            >
                <div className="
                    w-full text-center my-4
                    font-extrabold
                    2xl:text-6xl
                    lg:text-4xl
                ">
                    Générateur de critiques aléatoires
                </div>
                <div className="
                        w-full flex flex-col items-center justify-around
                        italic text-center overflow-y-auto overflow-x-visible
                        h-3/5
                        text-base leading-normal
                        2xl:text-xl 2xl:leading-relaxed
                ">
                    <p>Ces critiques ont été générées aléatoirement par une intelligence artificielle. Vous pouvez vous en inspirer librement pour rédiger vos propres critiques.Le but de ce générateur est de proposer au spectateur une expérience ludique sur la thématique du hasard et des arts numériques génératifs, et ainsi de prolonger l'expérience du spectacle.</p>
                    <p>Malgré nos meilleurs efforts, les critiques étant soumises aux dures lois du hasard, nous ne pouvons pas garantir que les contenus générés respectent les conditions de service de BilletReduc. Aussi, assurez-vous de ne pas publier de contenu qui ne soit pas en accord avec les conditions de service de la plateforme.</p>
                    <p className="underline text-gray-400"><a href="https://github.com/PierreLemmel/plml-shows-api" target="_blank">Retrouver le projet sur GitHub</a></p>
                </div>
                <AleasButton onClick={() => setShowHelp(false)}>
                    Ok
                </AleasButton>
            </div>
        </motion.div>
    </div>
}