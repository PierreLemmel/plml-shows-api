import AleasBackground from '@/components/aleas/aleas-background';
import { AleasButton } from '@/components/aleas/aleas-buttons';
import AleasHead from '@/components/aleas/aleas-head'
import { AleasMainContainer, AleasTitle } from '@/components/aleas/aleas-layout';
import Link from 'next/link';


const Home = () => <>
	<AleasHead />
	<main className="fullscreen relative overflow-hidden">
		<AleasBackground />
		<div className="full absolute top-0 center-child text-center">
			<AleasMainContainer>
				<AleasTitle>
					Aléas, Improvisation aléatoire
				</AleasTitle>
				
				<div className="flex flex-col gap-8 sm:items-stretch">

					<Link href="/billetreduc">
						<AleasButton>
							Générateur de critiques BilletReduc
						</AleasButton>
					</Link>

					<Link href="/photos">
						<AleasButton>
							Galerie photos
						</AleasButton>
					</Link>

					<Link href="/random-timer">
						<AleasButton>
							Random Timer
						</AleasButton>
					</Link>

				</div>
				
				<div>Réalisation technique : <a className="text-gray-400 underline" href="https://linktr.ee/plemmel" target="_blank" rel="noreferrer">Pierre Lemmel</a></div>
			</AleasMainContainer>
		</div>
	</main>
</>

export default Home;