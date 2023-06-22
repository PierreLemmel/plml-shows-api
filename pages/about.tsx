import AleasBackground from "@/components/aleas/aleas-background";
import AleasHead from "@/components/aleas/aleas-head";
import { AleasMainContainer, AleasMainLayout, AleasTitle } from "@/components/aleas/aleas-layout"

const About = () => {

    return <>
        <AleasHead />
        <main className="fullscreen relative overflow-hidden">
            <AleasBackground />
            <div className="full absolute top-0 center-child text-center">
                <AleasMainContainer>
                    <AleasTitle>
                        Aléas, Improvisation aléatoire
                    </AleasTitle>
                    
                    <div className="flex flex-col gap-4 overflow-auto pr-2 text-justify">

                        <p>Dans ce spectacle unique, les comédiens remettent leur sort entre les mains du hasard ! La mise en scène, le son, la lumière et le temps sont entièrement contrôlés aléatoirement par un ordinateur. Les artistes vont dès lors rivaliser d&apos;ingéniosité pour transformer ces hasardeuses propositions en moments de pur plaisir pour le spectateur.</p>

                        <p>Drôle de chose que le hasard ! À la fois incontrôlable, surprenant et implacable, tantôt généreux, tantôt capricieux, on dit de lui qu&apos;il fait parfois bien les choses.</p>

                        <p>Alors laissez-le vous embarquer dans une succession d&apos;histoires et de tableaux parfois drôles, parfois touchants, mais toujours inattendus !</p>

                        <div className="center-child w-full my-4"><img src='/img/aleas-1200x630.jpg' className="w-[400px] min-w-[75%] max-w-full " /></div>

                        <h2 className="text-3xl italic font-bold">Note d&apos;intention</h2>
                        
                        <p>Aléas est né d&apos;une envie : développer une nouvelle forme d&apos;improvisation visuelle, narrative, impulsée par le hasard de la mise en scène. Nous souhaitons créer des ponts entre le théâtre et la science du hasard.</p>

                        <p>Aléas vise à expérimenter le hasard en théâtre improvisé en faisant usage des nouvelles technologies. Il se place dans une période où les nouvelles technologies et notamment les intelligences artificielles génératives prennent une part de plus en plus importante dans le domaine artistique (génération de textes, d&apos;images, de musiques...). Cela suscite de nombreuses interrogations sur le rôle des artistes dans différents domaines et sur le futur de la création artistique.</p>

                        <p>Dans ce contexte, il s&apos;agit de mettre ces nouvelles technologies à profit afin de créer un environnement sonore et lumineux aléatoire dans lequel les comédien-ne-s improvisateur-ice-s peuvent expérimenter et auxquels ils doivent s&apos;adapter.</p>

                        <p>Nous pensons que le hasard étant par nature quelque chose d&apos;incontrôlable, il peut être une source d&apos;imprévus et de création extraordinaire. Il nous ramène à une forme d&apos;improvisation la plus brute et la plus pure qui soit. Comment aborde-t-on la scène en s&apos;abandonnant complètement au hasard ?</p>

                    </div>
                </AleasMainContainer>
            </div>
        </main>
    </>
}

export default About;