import AleasBackground from '@/components/aleas-components/aleas-background';
import { AleasButton } from '@/components/aleas-components/aleas-buttons';
import AleasHead from '@/components/aleas-components/aleas-head'
import { AleasModalContainer, AleasTitle } from '@/components/aleas-components/aleas-layout';
import Link from 'next/link';


const Home = () => <>
	<AleasHead />
	<main className="fullscreen relative overflow-hidden">
		<AleasBackground />
		<div className="full absolute top-0 center-child text-center">
			<AleasModalContainer>
				<AleasTitle>
					Aléas, Improvisation aléatoire
				</AleasTitle>
				
				<div className="flex flex-col gap-8 sm:items-stretch">

					<Link href="/about">
						<AleasButton>
							Présentation du spectacle
						</AleasButton>
					</Link>

					<Link href="https://www.billetreduc.com/326448/evt.htm">
						<AleasButton>
							Réservations
						</AleasButton>
					</Link>

					<Link href="/billetreduc">
						<AleasButton>
							Générateur de critiques BilletReduc
						</AleasButton>
					</Link>

				</div>
				
				<div>Nous contacter : <Link href="mailto:dansletitre@gmail.com" className="hover:text-blue-200 hover:font-bold">dansletitre@gmail.com</Link></div>
				{/* <div>Réalisation technique : <a className="text-gray-400 underline" href="https://linktr.ee/plemmel" target="_blank" rel="noreferrer">Pierre Lemmel</a></div> */}
			</AleasModalContainer>
		</div>
	</main>
</>

export default Home;