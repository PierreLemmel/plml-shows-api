import AleasBackground from '@/components/aleas-components/aleas-background';
import { AleasButton } from '@/components/aleas-components/aleas-buttons';
import AleasHead from '@/components/aleas-components/aleas-head'
import { AleasModalContainer, AleasTitle } from '@/components/aleas-components/aleas-layout';
import AleasModalDialog from '@/components/aleas-components/aleas-modal-dialog';
import { useAuth } from '@/lib/services/api/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';


const Home = () => {

	const { user } = useAuth();

	return <>
		<AleasHead />
		<main className="fullscreen relative overflow-hidden">
			<AleasBackground />
			<div className="full absolute top-0 center-child text-center">
				<AleasModalContainer>
					<AleasTitle>
						Aléas, Improvisation aléatoire
					</AleasTitle>

					<div className="flex flex-col gap-8 justify-center flex-grow sm:items-stretch">

						<Presentation />
						{/* <Reservations /> */}
						<NextDates />
						<BilletReduc />

						{user && <ShowManagement />}

						<ContactUs />

					</div>

					
				</AleasModalContainer>
			</div>
		</main>
	</>;
}


const Presentation = () => <Link href="/about">
	<AleasButton>
		Présentation du spectacle
	</AleasButton>
</Link>

const Reservations = () => <Link href="https://www.billetreduc.com/326448/evt.htm">
	<AleasButton>
		Réservations
	</AleasButton>
</Link>

const NextDates = () => {

	const [open, setOpen] = useState(false);

	return <>
		<AleasButton onClick={() => setOpen(true)}>
			Prochaines dates
		</AleasButton>
		<AleasModalDialog isOpen={open} onConfirm={() => setOpen(false)} hasCancel={false}>
			<div className="flex flex-col gap-4 justify-center items-center text-lg">
				<div className="text-2xl mb-3">
					Nos prochaines dates
				</div>
				<div>
					13 juin 2024 - 20h30, Impro-en-Seine, Théâtre du Gymnase, Paris
				</div>
				<div>
					Du 29 juin au 21 juillet 2024 - 21h05, Festival d'Avignon, Théâtre de la Luna
				</div>
			</div>
		</AleasModalDialog>
	</>;
}

const BilletReduc = () => <Link href="/billetreduc">
	<AleasButton>
		Générateur de critiques BilletReduc
	</AleasButton>
</Link>


const ContactUs = () => {

	const [open, setOpen] = useState(false);

	return <>
		<AleasButton onClick={() => setOpen(true)}>
			Nous contacter
		</AleasButton>
		<AleasModalDialog isOpen={open} hasCancel={false} onConfirm={() => setOpen(false)}>
			<div className="flex flex-col gap-5 justify-center items-center text-lg mb-6">
				<div className="text-2xl mb-4">
					Nous contacter
				</div>
				<div>
					Mail : <Link href="mailto:dansletitre@gmail.com" className="hover:text-blue-200 hover:font-bold">dansletitre@gmail.com</Link>
				</div>
				<div>
					Diffusion : Marie Montalescot - <Link href="tel:+33649539255" className="hover:text-blue-200 hover:font-bold">06 49 53 92 55</Link>
				</div>
				<div className="flex flex-row gap-3">
					<Image src="/img/icons/ig_icon.webp" alt="instagram Icon" width={28} height={28} />
					<Link href="https://www.instagram.com/aleas_spectacle">Instagram</Link>
				</div>
				<div>
					Réalisation technique : <Link className="text-gray-400 underline" href="https://linktr.ee/plemmel" target="_blank" rel="noreferrer">Pierre Lemmel</Link>
				</div>
			</div>
		</AleasModalDialog>
	</>;
	return <>

		{/* <div>Nous contacter : <Link href="mailto:dansletitre@gmail.com" className="hover:text-blue-200 hover:font-bold">dansletitre@gmail.com</Link></div>
        <div>Réalisation technique : <a className="text-gray-400 underline" href="https://linktr.ee/plemmel" target="_blank" rel="noreferrer">Pierre Lemmel</a></div> */}
	</>;
}

const ShowManagement = () => <Link href="/show">
	<AleasButton>
		Gérer mes spectacles
	</AleasButton>
</Link>

export default Home;