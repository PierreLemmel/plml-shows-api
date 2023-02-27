import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useEffect, useRef, useState } from "react";
import { randomInt, } from '@/lib/services/helpers';
import AleasBackground from '@/components/aleas/aleas-background';
import { AleasButton, AleasRoundButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head';
import { AleasMainContainer, AleasTitle } from '@/components/aleas/aleas-layout';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';

export const getStaticProps: GetStaticProps = async () => {

    return {
        props: {

        }
    }
}

type SumUpStep = "Home"|"Pay";

export default function SumUp(props: InferGetStaticPropsType<typeof getStaticProps>) {

    const showMain = true;

    const [step, setStep] = useState<SumUpStep>("Home");

    const onPrixReduit = () => {
        toast("Prix réduit")
    }

    const onPrixConscient = () => {
        toast("Prix conscient")
    }

    const onPrixSoutien = () => {
        toast("Prix soutien")
    }

    const onPrixLibre = () => {
        toast("Prix libre")
    }

    const onPrixAleatoire = () => {
        toast("Prix aléatoire")
    }

    return <>
        <AleasHead />
        
        <main className="fullscreen relative overflow-hidden">
            
            <AleasBackground />

            {/* Home */}
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
                animate={showMain ? "show" : "hide"}
                initial="show"
                transition={{
                    duration: showMain ? 0.8 : 1.1,
                    type: 'spring'
                }}
            >
                <AleasMainContainer>
                    <AleasTitle>
                        Chapeau électronique
                    </AleasTitle>
                    <div className="flex flex-col gap-4 text-center">
                        <p>En donnant, vous permettez au spectacle de vivre : de rémunérer les artistes, les créateurs, payer les frais de fonctionnement, acheter du matériel technique, aller à Avignon et louer un théâtre pour la saison prochaine...
                        </p>
                        <p>Alors pour tout ça, merci !</p>
                    </div>
                    <div className="
                        flex flex-col items-stretch justify-center
                        flex-grow
                        gap-8 sm:gap-5
                    ">
                        <AleasButton onClick={onPrixReduit}>Prix réduit - 5€</AleasButton>
                        <AleasButton onClick={onPrixConscient}>Prix conscient - 10€</AleasButton>
                        <AleasButton onClick={onPrixSoutien}>Prix soutien - 20€</AleasButton>
                        <AleasButton onClick={onPrixLibre}>Prix libre</AleasButton>
                        <AleasButton onClick={onPrixAleatoire}>Aléatoire - 1€ à 25€</AleasButton>
                    </div>
                </AleasMainContainer>
            </motion.div>

            <ToastContainer
                position="bottom-center"
                theme='dark'
                autoClose={2000}
                hideProgressBar={true}
                pauseOnFocusLoss={false}
                pauseOnHover={false}
            />
            
        </main>
        
    </>
}